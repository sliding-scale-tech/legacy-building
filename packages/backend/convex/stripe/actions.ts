"use node";

import { StripeSubscriptions } from "@convex-dev/stripe";
import { ConvexError, v } from "convex/values";
import Stripe from "stripe";
import { components, internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { action } from "../_generated/server";
import {
	getActiveSubscriptionForUser,
	requireStripeSecretKey,
} from "./helpers";

const stripeSubscriptions = new StripeSubscriptions(components.stripe, {});

const intervalValidator = v.union(v.literal("monthly"), v.literal("annual"));

function requireSecretKey(): string {
	try {
		return requireStripeSecretKey();
	} catch (error) {
		throw new ConvexError({
			code: "STRIPE_NOT_CONFIGURED",
			message:
				error instanceof Error ? error.message : "Billing is not configured.",
		});
	}
}

/** Shared Checkout session builder (new subscription, full Stripe invoice flow). */
async function createSubscriptionCheckoutUrl(
	stripe: Stripe,
	args: {
		customerId: string;
		userId: string;
		product: Doc<"products">;
		successUrl: string;
		cancelUrl: string;
		skipTrial?: boolean;
	},
): Promise<string> {
	const applyTrial = args.product.trialDays > 0 && !args.skipTrial;
	const session = await stripe.checkout.sessions.create({
		mode: "subscription",
		customer: args.customerId,
		line_items: [{ price: args.product.stripePriceId, quantity: 1 }],
		success_url: args.successUrl,
		cancel_url: args.cancelUrl,
		allow_promotion_codes: true,
		metadata: { userId: args.userId },
		subscription_data: {
			metadata: { userId: args.userId },
			...(applyTrial ? { trial_period_days: args.product.trialDays } : {}),
		},
	});

	if (!session.url) {
		throw new ConvexError({
			code: "CHECKOUT_FAILED",
			message: "Stripe did not return a checkout URL. Please try again.",
		});
	}

	return session.url;
}

type EmbeddedCheckoutResult = {
	clientSecret: string;
	intentType: "setup" | "payment";
	customerId: string;
	subscriptionId: string;
	/** True when we created a standalone SetupIntent (needs finalize after confirm). */
	usesFallbackSetup: boolean;
};

type InvoiceWithSecrets = Stripe.Invoice & {
	confirmation_secret?: { client_secret: string } | null;
	payment_intent?: Stripe.PaymentIntent | string | null;
};

async function resolveSetupIntentSecret(
	stripe: Stripe,
	pending: Stripe.SetupIntent | string | null | undefined,
): Promise<string | null> {
	if (typeof pending === "object" && pending?.client_secret) {
		return pending.client_secret;
	}
	if (typeof pending === "string") {
		const setupIntent = await stripe.setupIntents.retrieve(pending);
		return setupIntent.client_secret ?? null;
	}
	return null;
}

async function resolveInvoicePaymentSecret(
	stripe: Stripe,
	invoice: InvoiceWithSecrets,
): Promise<string | null> {
	if (invoice.confirmation_secret?.client_secret) {
		return invoice.confirmation_secret.client_secret;
	}

	const paymentIntent = invoice.payment_intent;
	if (typeof paymentIntent === "object" && paymentIntent?.client_secret) {
		return paymentIntent.client_secret;
	}
	if (typeof paymentIntent === "string") {
		const resolved = await stripe.paymentIntents.retrieve(paymentIntent);
		return resolved.client_secret ?? null;
	}
	return null;
}

/** Resolve a client secret for Stripe Elements from an incomplete subscription. */
async function resolveEmbeddedCheckoutSecret(
	stripe: Stripe,
	subscription: Stripe.Subscription,
	applyTrial: boolean,
	customerId: string,
	userId: string,
): Promise<EmbeddedCheckoutResult | null> {
	if (applyTrial) {
		const setupSecret = await resolveSetupIntentSecret(
			stripe,
			subscription.pending_setup_intent,
		);
		if (setupSecret) {
			return {
				clientSecret: setupSecret,
				intentType: "setup",
				customerId,
				subscriptionId: subscription.id,
				usesFallbackSetup: false,
			};
		}

		// Some Stripe API versions omit pending_setup_intent on $0 trial invoices.
		const setupIntent = await stripe.setupIntents.create({
			customer: customerId,
			automatic_payment_methods: { enabled: true },
			usage: "off_session",
			metadata: { userId, subscriptionId: subscription.id },
		});
		if (!setupIntent.client_secret) return null;

		return {
			clientSecret: setupIntent.client_secret,
			intentType: "setup",
			customerId,
			subscriptionId: subscription.id,
			usesFallbackSetup: true,
		};
	}

	const invoice =
		typeof subscription.latest_invoice === "string"
			? await stripe.invoices.retrieve(subscription.latest_invoice, {
					expand: ["confirmation_secret", "payment_intent"],
				})
			: subscription.latest_invoice;

	if (invoice && typeof invoice === "object") {
		const paymentSecret = await resolveInvoicePaymentSecret(
			stripe,
			invoice as InvoiceWithSecrets,
		);
		if (paymentSecret) {
			return {
				clientSecret: paymentSecret,
				intentType: "payment",
				customerId,
				subscriptionId: subscription.id,
				usesFallbackSetup: false,
			};
		}
	}

	return null;
}

async function startEmbeddedProductCheckout(
	stripe: Stripe,
	customerId: string,
	userId: string,
	product: Doc<"products">,
	applyTrial: boolean,
): Promise<EmbeddedCheckoutResult> {
	const subscription: Stripe.Subscription = await stripe.subscriptions.create({
		customer: customerId,
		items: [{ price: product.stripePriceId }],
		metadata: { userId },
		...(applyTrial ? { trial_period_days: product.trialDays } : {}),
		payment_behavior: "default_incomplete",
		payment_settings: {
			save_default_payment_method: "on_subscription",
		},
		expand: ["latest_invoice.confirmation_secret", "pending_setup_intent"],
	});

	const checkout = await resolveEmbeddedCheckoutSecret(
		stripe,
		subscription,
		applyTrial,
		customerId,
		userId,
	);
	if (!checkout) {
		throw new ConvexError({
			code: "CHECKOUT_FAILED",
			message: "Could not start checkout. Please try again.",
		});
	}
	return checkout;
}

type EmbeddedCheckoutResponse =
	| (EmbeddedCheckoutResult & { completed: false })
	| { completed: true };

const embeddedCheckoutResponseValidator = v.object({
	completed: v.boolean(),
	clientSecret: v.optional(v.string()),
	intentType: v.optional(v.union(v.literal("setup"), v.literal("payment"))),
	customerId: v.optional(v.string()),
	subscriptionId: v.optional(v.string()),
	usesFallbackSetup: v.optional(v.boolean()),
});

/**
 * Start a subscription checkout for the signed-in user.
 *
 * Plan/price details (price id, trial days) come from the `products` table. The
 * trial is applied here because the component's own checkout helper does not
 * support it. The resulting subscription is synced back by the component webhook.
 */
export const createCheckoutSession = action({
	args: {
		interval: intervalValidator,
		successUrl: v.string(),
		cancelUrl: v.string(),
		skipTrial: v.optional(v.boolean()),
	},
	returns: v.object({ url: v.string() }),
	handler: async (ctx, args): Promise<{ url: string }> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to subscribe.",
			});
		}

		const userId = identity.subject;

		// Guard: an existing live subscription must use changePlan, not a 2nd checkout.
		const existing = await getActiveSubscriptionForUser(ctx, userId);
		if (existing) {
			throw new ConvexError({
				code: "ALREADY_SUBSCRIBED",
				message:
					"You already have an active subscription. Use change plan to switch instead.",
			});
		}

		const product: Doc<"products"> | null = await ctx.runQuery(
			internal.stripe.products.queries.getByInterval,
			{ interval: args.interval },
		);
		if (!product) {
			throw new ConvexError({
				code: "PLAN_UNAVAILABLE",
				message: "That plan is not available right now.",
			});
		}

		const { customerId } = await stripeSubscriptions.getOrCreateCustomer(ctx, {
			userId,
			email: identity.email ?? undefined,
			name: identity.name ?? undefined,
		});

		await ctx.runMutation(internal.stripe.mutations.linkStripeCustomer, {
			clerkUserId: userId,
			stripeCustomerId: customerId,
		});

		const stripe = new Stripe(requireSecretKey());
		const url = await createSubscriptionCheckoutUrl(stripe, {
			customerId,
			userId,
			product,
			successUrl: args.successUrl,
			cancelUrl: args.cancelUrl,
			skipTrial: args.skipTrial,
		});

		return { url };
	},
});

/**
 * Create an incomplete subscription and return a client secret for Stripe Elements
 * (SetupIntent for trials, PaymentIntent for immediate billing).
 */
export const createEmbeddedSubscriptionCheckout = action({
	args: {
		interval: intervalValidator,
		skipTrial: v.optional(v.boolean()),
	},
	returns: v.object({
		clientSecret: v.string(),
		intentType: v.union(v.literal("setup"), v.literal("payment")),
		customerId: v.string(),
		subscriptionId: v.string(),
		usesFallbackSetup: v.boolean(),
	}),
	handler: async (ctx, args): Promise<EmbeddedCheckoutResult> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to subscribe.",
			});
		}

		const userId = identity.subject;
		const existing = await getActiveSubscriptionForUser(ctx, userId);
		if (existing) {
			throw new ConvexError({
				code: "ALREADY_SUBSCRIBED",
				message:
					"You already have an active subscription. Use change plan to switch instead.",
			});
		}

		const product: Doc<"products"> | null = await ctx.runQuery(
			internal.stripe.products.queries.getByInterval,
			{ interval: args.interval },
		);
		if (!product) {
			throw new ConvexError({
				code: "PLAN_UNAVAILABLE",
				message: "That plan is not available right now.",
			});
		}

		const { customerId } = await stripeSubscriptions.getOrCreateCustomer(ctx, {
			userId,
			email: identity.email ?? undefined,
			name: identity.name ?? undefined,
		});

		await ctx.runMutation(internal.stripe.mutations.linkStripeCustomer, {
			clerkUserId: userId,
			stripeCustomerId: customerId,
		});

		const applyTrial = product.trialDays > 0 && !args.skipTrial;
		const stripe = new Stripe(requireSecretKey());

		return await startEmbeddedProductCheckout(
			stripe,
			customerId,
			userId,
			product,
			applyTrial,
		);
	},
});

/** Embedded checkout when upgrading (trial → paid or monthly → annual). */
export const createEmbeddedUpgradeCheckout = action({
	args: {
		targetInterval: intervalValidator,
	},
	returns: embeddedCheckoutResponseValidator,
	handler: async (ctx, args): Promise<EmbeddedCheckoutResponse> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to change your plan.",
			});
		}

		const userId = identity.subject;
		const stripe = new Stripe(requireSecretKey());

		const targetProduct: Doc<"products"> | null = await ctx.runQuery(
			internal.stripe.products.queries.getByInterval,
			{ interval: args.targetInterval },
		);
		if (!targetProduct) {
			throw new ConvexError({
				code: "PLAN_UNAVAILABLE",
				message: "That plan is not available right now.",
			});
		}

		const customer = await ctx.runQuery(
			components.stripe.public.getCustomerByUserId,
			{ userId },
		);
		if (!customer) {
			throw new ConvexError({
				code: "NO_ACTIVE_SUBSCRIPTION",
				message: "You don't have an active subscription to change.",
			});
		}

		const customerId = customer.stripeCustomerId;

		const resumeIncompleteCheckout =
			async (): Promise<EmbeddedCheckoutResponse | null> => {
				const { data: openSubscriptions } = await stripe.subscriptions.list({
					customer: customerId,
					status: "incomplete",
					limit: 5,
					expand: [
						"data.latest_invoice.confirmation_secret",
						"data.pending_setup_intent",
					],
				});
				const pendingTarget = openSubscriptions.find(
					(openSub) =>
						openSub.items.data[0]?.price.id === targetProduct.stripePriceId,
				);
				if (!pendingTarget) return null;

				const checkout = await resolveEmbeddedCheckoutSecret(
					stripe,
					pendingTarget,
					false,
					customerId,
					userId,
				);
				return checkout ? { ...checkout, completed: false } : null;
			};

		const resumed = await resumeIncompleteCheckout();
		if (resumed) return resumed;

		const subscription = await getActiveSubscriptionForUser(ctx, userId);
		if (!subscription) {
			throw new ConvexError({
				code: "NO_ACTIVE_SUBSCRIPTION",
				message: "You don't have an active subscription to change.",
			});
		}

		const currentProduct: Doc<"products"> | null = await ctx.runQuery(
			internal.stripe.products.queries.getByStripePriceId,
			{ stripePriceId: subscription.priceId },
		);
		if (!currentProduct) {
			throw new ConvexError({
				code: "UNKNOWN_PLAN",
				message:
					"We couldn't identify your current plan. Please contact support.",
			});
		}

		if (currentProduct.interval === args.targetInterval) {
			throw new ConvexError({
				code: "SAME_PLAN",
				message: "You're already on that plan.",
			});
		}

		if (
			args.targetInterval === "monthly" &&
			currentProduct.interval === "annual"
		) {
			throw new ConvexError({
				code: "SCHEDULED_DOWNGRADE",
				message:
					"Switching to monthly is scheduled at the end of your billing period.",
			});
		}

		if (subscription.status === "trialing") {
			await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
			await ctx.runMutation(internal.stripe.mutations.clearPendingPlanChange, {
				clerkUserId: userId,
			});

			const checkout = await startEmbeddedProductCheckout(
				stripe,
				customerId,
				userId,
				targetProduct,
				false,
			);
			return { ...checkout, completed: false };
		}

		const stripeSub = await stripe.subscriptions.retrieve(
			subscription.stripeSubscriptionId,
		);
		const itemId = stripeSub.items.data[0]?.id;
		if (!itemId) {
			throw new ConvexError({
				code: "CHANGE_FAILED",
				message: "Could not update your subscription. Please try again.",
			});
		}

		const updated = await stripe.subscriptions.update(
			subscription.stripeSubscriptionId,
			{
				items: [{ id: itemId, price: targetProduct.stripePriceId }],
				proration_behavior: "always_invoice",
				payment_behavior: "pending_if_incomplete",
				metadata: { userId },
				expand: ["latest_invoice.confirmation_secret", "pending_setup_intent"],
			},
		);

		await ctx.runMutation(internal.stripe.mutations.clearPendingPlanChange, {
			clerkUserId: userId,
		});

		const checkout = await resolveEmbeddedCheckoutSecret(
			stripe,
			updated,
			false,
			customerId,
			userId,
		);
		if (checkout) {
			return { ...checkout, completed: false };
		}

		return { completed: true };
	},
});

/** Default card on file for the billing management page. */
export const getDefaultPaymentMethod = action({
	args: {},
	returns: v.union(
		v.object({
			brand: v.string(),
			last4: v.string(),
			expMonth: v.number(),
			expYear: v.number(),
		}),
		v.null(),
	),
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		const customer = await ctx.runQuery(
			components.stripe.public.getCustomerByUserId,
			{ userId: identity.subject },
		);
		if (!customer) return null;

		const subscription = await getActiveSubscriptionForUser(
			ctx,
			identity.subject,
		);

		const stripe = new Stripe(requireSecretKey());
		const paymentMethod = await resolvePaymentMethodDetails(
			stripe,
			customer.stripeCustomerId,
			subscription?.stripeSubscriptionId,
		);

		if (paymentMethod?.type !== "card" || !paymentMethod.card) {
			return null;
		}

		return {
			brand: paymentMethod.card.brand,
			last4: paymentMethod.card.last4,
			expMonth: paymentMethod.card.exp_month,
			expYear: paymentMethod.card.exp_year,
		};
	},
});

/**
 * Attach a confirmed SetupIntent payment method to a trialing subscription when
 * Stripe did not provide a subscription-linked pending_setup_intent.
 */
export const finalizeEmbeddedTrialSetup = action({
	args: {
		subscriptionId: v.string(),
		setupIntentId: v.string(),
	},
	returns: v.null(),
	handler: async (ctx, args): Promise<null> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to complete checkout.",
			});
		}

		const stripe = new Stripe(requireSecretKey());
		const setupIntent = await stripe.setupIntents.retrieve(args.setupIntentId);

		if (setupIntent.metadata?.userId !== identity.subject) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "This payment session does not belong to your account.",
			});
		}

		if (setupIntent.status !== "succeeded") {
			throw new ConvexError({
				code: "PAYMENT_INCOMPLETE",
				message: "Payment method was not confirmed. Please try again.",
			});
		}

		const paymentMethod = setupIntent.payment_method;
		if (!paymentMethod) {
			throw new ConvexError({
				code: "PAYMENT_INCOMPLETE",
				message: "No payment method was saved. Please try again.",
			});
		}

		const paymentMethodId =
			typeof paymentMethod === "string" ? paymentMethod : paymentMethod.id;

		const subscription = await stripe.subscriptions.retrieve(
			args.subscriptionId,
		);

		await stripe.subscriptions.update(args.subscriptionId, {
			default_payment_method: paymentMethodId,
		});

		await stripe.customers.update(subscription.customer as string, {
			invoice_settings: { default_payment_method: paymentMethodId },
		});

		return null;
	},
});

/**
 * During a free trial, plan changes must go through Checkout so Stripe creates a
 * new subscription and invoice (no silent in-app upgrade).
 *
 * Cancels the trialing subscription, then opens Checkout for the target plan.
 */
export const createPlanChangeCheckout = action({
	args: {
		targetInterval: intervalValidator,
		successUrl: v.string(),
		cancelUrl: v.string(),
	},
	returns: v.object({ url: v.string() }),
	handler: async (ctx, args): Promise<{ url: string }> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to change your plan.",
			});
		}

		const userId = identity.subject;
		const subscription = await getActiveSubscriptionForUser(ctx, userId);
		if (subscription?.status !== "trialing") {
			throw new ConvexError({
				code: "NOT_ON_TRIAL",
				message:
					"Checkout is only required when changing plans during a free trial.",
			});
		}

		const targetProduct: Doc<"products"> | null = await ctx.runQuery(
			internal.stripe.products.queries.getByInterval,
			{ interval: args.targetInterval },
		);
		if (!targetProduct) {
			throw new ConvexError({
				code: "PLAN_UNAVAILABLE",
				message: "That plan is not available right now.",
			});
		}

		const currentProduct: Doc<"products"> | null = await ctx.runQuery(
			internal.stripe.products.queries.getByStripePriceId,
			{ stripePriceId: subscription.priceId },
		);
		if (currentProduct?.interval === args.targetInterval) {
			throw new ConvexError({
				code: "SAME_PLAN",
				message: "You're already on that plan.",
			});
		}

		const stripe = new Stripe(requireSecretKey());

		// End the trial subscription so Checkout can start a paid one.
		await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

		await ctx.runMutation(internal.stripe.mutations.clearPendingPlanChange, {
			clerkUserId: userId,
		});

		const url = await createSubscriptionCheckoutUrl(stripe, {
			customerId: subscription.stripeCustomerId,
			userId,
			product: targetProduct,
			successUrl: args.successUrl,
			cancelUrl: args.cancelUrl,
		});

		return { url };
	},
});

/**
 * Switch the user's existing subscription to a different plan.
 *
 * - Free trial: use `createPlanChangeCheckout` (Stripe Checkout), not this action.
 * - Monthly -> Annual (paid): immediate switch with proration.
 * - Annual -> Monthly (downgrade): deferred via a subscription schedule at period end.
 */
export const changePlan = action({
	args: { targetInterval: intervalValidator },
	returns: v.object({
		effect: v.union(v.literal("immediate"), v.literal("scheduled")),
		effectiveAt: v.union(v.number(), v.null()),
	}),
	handler: async (
		ctx,
		args,
	): Promise<{
		effect: "immediate" | "scheduled";
		effectiveAt: number | null;
	}> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to change your plan.",
			});
		}
		const userId = identity.subject;

		const subscription = await getActiveSubscriptionForUser(ctx, userId);
		if (!subscription) {
			throw new ConvexError({
				code: "NO_ACTIVE_SUBSCRIPTION",
				message: "You don't have an active subscription to change.",
			});
		}

		if (subscription.status === "trialing") {
			throw new ConvexError({
				code: "TRIAL_REQUIRES_CHECKOUT",
				message:
					"Changing plans during your free trial requires completing checkout for the new plan.",
			});
		}

		const currentProduct: Doc<"products"> | null = await ctx.runQuery(
			internal.stripe.products.queries.getByStripePriceId,
			{ stripePriceId: subscription.priceId },
		);
		if (!currentProduct) {
			throw new ConvexError({
				code: "UNKNOWN_PLAN",
				message:
					"We couldn't identify your current plan. Please contact support.",
			});
		}

		if (currentProduct.interval === args.targetInterval) {
			throw new ConvexError({
				code: "SAME_PLAN",
				message: "You're already on that plan.",
			});
		}

		const targetProduct: Doc<"products"> | null = await ctx.runQuery(
			internal.stripe.products.queries.getByInterval,
			{ interval: args.targetInterval },
		);
		if (!targetProduct) {
			throw new ConvexError({
				code: "PLAN_UNAVAILABLE",
				message: "That plan is not available right now.",
			});
		}

		const stripe = new Stripe(requireSecretKey());

		// Upgrade: monthly -> annual, immediate with proration.
		if (args.targetInterval === "annual") {
			const stripeSub = await stripe.subscriptions.retrieve(
				subscription.stripeSubscriptionId,
			);
			const itemId = stripeSub.items.data[0]?.id;
			if (!itemId) {
				throw new ConvexError({
					code: "CHANGE_FAILED",
					message: "Could not update your subscription. Please try again.",
				});
			}

			await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
				items: [{ id: itemId, price: targetProduct.stripePriceId }],
				proration_behavior: "create_prorations",
				metadata: { userId },
			});

			await ctx.runMutation(internal.stripe.mutations.clearPendingPlanChange, {
				clerkUserId: userId,
			});

			return { effect: "immediate" as const, effectiveAt: null };
		}

		// Downgrade: annual -> monthly, deferred to end of current period.
		const schedule = await stripe.subscriptionSchedules.create({
			from_subscription: subscription.stripeSubscriptionId,
		});
		const currentPhase = schedule.phases[0];
		if (!currentPhase) {
			throw new ConvexError({
				code: "CHANGE_FAILED",
				message: "Could not schedule your plan change. Please try again.",
			});
		}

		await stripe.subscriptionSchedules.update(schedule.id, {
			end_behavior: "release",
			phases: [
				{
					items: [{ price: currentProduct.stripePriceId, quantity: 1 }],
					start_date: currentPhase.start_date,
					end_date: currentPhase.end_date,
				},
				{
					items: [{ price: targetProduct.stripePriceId, quantity: 1 }],
				},
			],
			metadata: { userId },
		});

		const effectiveAt = currentPhase.end_date;
		await ctx.runMutation(internal.stripe.mutations.setPendingPlanChange, {
			clerkUserId: userId,
			interval: args.targetInterval,
			effectiveAt,
		});
		return { effect: "scheduled" as const, effectiveAt };
	},
});

/** Open the Stripe Customer Portal so the user can manage payment methods and invoices. */
export const createBillingPortalSession = action({
	args: { returnUrl: v.string() },
	returns: v.object({ url: v.string() }),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to manage billing.",
			});
		}

		const customer = await ctx.runQuery(
			components.stripe.public.getCustomerByUserId,
			{ userId: identity.subject },
		);
		if (!customer) {
			throw new ConvexError({
				code: "NO_BILLING_ACCOUNT",
				message: "No billing account found yet. Choose a plan to get started.",
			});
		}

		const { url } = await stripeSubscriptions.createCustomerPortalSession(ctx, {
			customerId: customer.stripeCustomerId,
			returnUrl: args.returnUrl,
		});

		return { url };
	},
});

type PaymentMethodKind = "card" | "google_pay" | "apple_pay" | "other";

function capitalizeBrand(brand: string) {
	return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function formatPaymentMethod(
	paymentMethod: Stripe.PaymentMethod | string | null | undefined,
): { label: string; kind: PaymentMethodKind } {
	if (!paymentMethod || typeof paymentMethod === "string") {
		return { label: "Payment method on file", kind: "other" };
	}

	if (paymentMethod.type === "card" && paymentMethod.card) {
		const brandLabel = capitalizeBrand(paymentMethod.card.brand);
		const masked = `${brandLabel} •••• ${paymentMethod.card.last4}`;
		const wallet = paymentMethod.card.wallet?.type;
		if (wallet === "google_pay") {
			return { label: `Google Pay · ${masked}`, kind: "google_pay" };
		}
		if (wallet === "apple_pay") {
			return { label: `Apple Pay · ${masked}`, kind: "apple_pay" };
		}
		return { label: masked, kind: "card" };
	}

	return {
		label: paymentMethod.type.replace(/_/g, " "),
		kind: "other",
	};
}

/** Resolve the payment method a customer used, with several Stripe fallbacks. */
async function resolvePaymentMethodDetails(
	stripe: Stripe,
	customerId: string,
	subscriptionId?: string | null,
): Promise<Stripe.PaymentMethod | null> {
	const expandPaymentMethod = async (
		paymentMethod: Stripe.PaymentMethod | string | null | undefined,
	): Promise<Stripe.PaymentMethod | null> => {
		if (!paymentMethod) return null;
		if (typeof paymentMethod === "object") return paymentMethod;
		return stripe.paymentMethods.retrieve(paymentMethod);
	};

	const customer = await stripe.customers.retrieve(customerId, {
		expand: ["invoice_settings.default_payment_method"],
	});
	if (!customer.deleted) {
		const fromCustomer = await expandPaymentMethod(
			customer.invoice_settings?.default_payment_method,
		);
		if (fromCustomer) return fromCustomer;
	}

	if (subscriptionId) {
		const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
			expand: ["default_payment_method"],
		});

		const fromSubscription = await expandPaymentMethod(
			subscription.default_payment_method,
		);
		if (fromSubscription) return fromSubscription;

		const latestInvoiceId =
			typeof subscription.latest_invoice === "string"
				? subscription.latest_invoice
				: subscription.latest_invoice?.id;
		if (latestInvoiceId) {
			const invoice = (await stripe.invoices.retrieve(latestInvoiceId, {
				expand: ["payment_intent"],
			})) as InvoiceWithSecrets;
			const paymentIntent = invoice.payment_intent;
			if (paymentIntent && typeof paymentIntent === "object") {
				const fromIntent = await expandPaymentMethod(
					paymentIntent.payment_method,
				);
				if (fromIntent) return fromIntent;
			}
		}
	}

	const { data: paymentMethods } = await stripe.paymentMethods.list({
		customer: customerId,
		type: "card",
		limit: 5,
	});
	if (paymentMethods[0]) return paymentMethods[0];

	const setupIntents = await stripe.setupIntents.list({
		customer: customerId,
		limit: 5,
	});
	for (const setupIntent of setupIntents.data) {
		if (setupIntent.status !== "succeeded") continue;
		const fromSetup = await expandPaymentMethod(setupIntent.payment_method);
		if (fromSetup) return fromSetup;
	}

	return null;
}

function subscriptionPeriodEnd(
	subscription: Stripe.Subscription,
): number | null {
	const itemPeriodEnd = subscription.items.data[0]?.current_period_end;
	if (itemPeriodEnd) return itemPeriodEnd;

	const legacySubscription = subscription as Stripe.Subscription & {
		current_period_end?: number;
	};
	return legacySubscription.current_period_end ?? null;
}

/** Subscription + payment details for the post-checkout success screen. */
export const getPaymentSuccessSummary = action({
	args: {},
	returns: v.union(
		v.object({
			planName: v.string(),
			billingCycle: v.string(),
			paymentMethodLabel: v.string(),
			paymentMethodKind: v.union(
				v.literal("card"),
				v.literal("google_pay"),
				v.literal("apple_pay"),
				v.literal("other"),
			),
			nextBillingDateMs: v.number(),
		}),
		v.null(),
	),
	handler: async (
		ctx,
	): Promise<{
		planName: string;
		billingCycle: string;
		paymentMethodLabel: string;
		paymentMethodKind: PaymentMethodKind;
		nextBillingDateMs: number;
	} | null> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to view payment details.",
			});
		}

		const userId = identity.subject;
		const stripe = new Stripe(requireSecretKey());

		let stripeSubscriptionId: string | null = null;
		let priceId: string | null = null;
		let currentPeriodEnd: number | null = null;
		let trialEnd: number | null = null;

		const componentSub = await getActiveSubscriptionForUser(ctx, userId);
		if (componentSub) {
			stripeSubscriptionId = componentSub.stripeSubscriptionId;
			priceId = componentSub.priceId;
			currentPeriodEnd = componentSub.currentPeriodEnd;
		}

		const customer = await ctx.runQuery(
			components.stripe.public.getCustomerByUserId,
			{ userId },
		);

		if (customer) {
			const stripeSubResponse = await stripe.subscriptions.list({
				customer: customer.stripeCustomerId,
				status: "all",
				limit: 10,
			});

			const liveStatuses = new Set(["active", "trialing", "past_due"]);
			const stripeSub =
				stripeSubResponse.data.find((sub) => liveStatuses.has(sub.status)) ??
				stripeSubResponse.data[0];

			if (stripeSub) {
				stripeSubscriptionId = stripeSub.id;
				priceId = stripeSub.items.data[0]?.price.id ?? priceId;
				currentPeriodEnd = subscriptionPeriodEnd(stripeSub);
				trialEnd = stripeSub.trial_end;
			}
		}

		if (!stripeSubscriptionId || !priceId) {
			return null;
		}

		if (!currentPeriodEnd) {
			const retrieved =
				await stripe.subscriptions.retrieve(stripeSubscriptionId);
			currentPeriodEnd = subscriptionPeriodEnd(retrieved);
			if (retrieved.trial_end) trialEnd = retrieved.trial_end;
		}

		if (!currentPeriodEnd) {
			return null;
		}

		const paymentMethod = customer
			? await resolvePaymentMethodDetails(
					stripe,
					customer.stripeCustomerId,
					stripeSubscriptionId,
				)
			: null;

		const periodEndSeconds = currentPeriodEnd;

		const product: Doc<"products"> | null = await ctx.runQuery(
			internal.stripe.products.queries.getByStripePriceId,
			{ stripePriceId: priceId },
		);

		const interval = product?.interval ?? "monthly";
		const planBaseName =
			product?.name ?? (interval === "annual" ? "Annual" : "Monthly");
		const { label, kind } = formatPaymentMethod(paymentMethod);
		const nextBillingDateMs =
			trialEnd && trialEnd > Math.floor(Date.now() / 1000)
				? trialEnd * 1000
				: periodEndSeconds * 1000;

		return {
			planName: `${planBaseName} Plan`,
			billingCycle: interval === "annual" ? "Annual" : "Monthly",
			paymentMethodLabel: label,
			paymentMethodKind: kind,
			nextBillingDateMs,
		};
	},
});

/** Cancel the user's active subscription (at period end by default). */
export const cancelSubscription = action({
	args: { atPeriodEnd: v.optional(v.boolean()) },
	returns: v.null(),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to cancel your subscription.",
			});
		}

		const target = await getActiveSubscriptionForUser(ctx, identity.subject);
		if (!target) {
			throw new ConvexError({
				code: "NO_ACTIVE_SUBSCRIPTION",
				message: "You don't have an active subscription to cancel.",
			});
		}

		await stripeSubscriptions.cancelSubscription(ctx, {
			stripeSubscriptionId: target.stripeSubscriptionId,
			cancelAtPeriodEnd: args.atPeriodEnd ?? true,
		});

		return null;
	},
});

/** Undo a pending cancellation so the subscription continues to renew. */
export const reactivateSubscription = action({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to reactivate your subscription.",
			});
		}

		const subscriptions = await ctx.runQuery(
			components.stripe.public.listSubscriptionsByUserId,
			{ userId: identity.subject },
		);
		const target = subscriptions.find(
			(s) =>
				s.cancelAtPeriodEnd &&
				(s.status === "active" || s.status === "trialing"),
		);
		if (!target) {
			throw new ConvexError({
				code: "NO_CANCELING_SUBSCRIPTION",
				message: "There's no scheduled cancellation to undo.",
			});
		}
		await stripeSubscriptions.reactivateSubscription(ctx, {
			stripeSubscriptionId: target.stripeSubscriptionId,
		});
		return null;
	},
});

/** Fetch invoices live from Stripe (fallback when component sync is empty). */
export const listMyInvoicesLive = action({
	args: {},
	returns: v.array(
		v.object({
			stripeInvoiceId: v.string(),
			created: v.number(),
			amountDue: v.number(),
			amountPaid: v.number(),
			status: v.string(),
			hostedInvoiceUrl: v.union(v.string(), v.null()),
		}),
	),
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		const customer = await ctx.runQuery(
			components.stripe.public.getCustomerByUserId,
			{ userId: identity.subject },
		);
		if (!customer) return [];

		const stripe = new Stripe(requireSecretKey());
		const { data } = await stripe.invoices.list({
			customer: customer.stripeCustomerId,
			limit: 24,
		});

		return data
			.filter((invoice) => invoice.id)
			.map((invoice) => ({
				stripeInvoiceId: invoice.id as string,
				created: invoice.created,
				amountDue: invoice.amount_due,
				amountPaid: invoice.amount_paid,
				status: invoice.status ?? "draft",
				hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
			}))
			.sort((a, b) => b.created - a.created);
	},
});

/**
 * Dev-only: cancel Stripe subscriptions and clear local billing state so you can
 * re-test subscribe / upgrade flows. Set ALLOW_BILLING_RESET=true in Convex env.
 */
export const resetMyBillingForTesting = action({
	args: {},
	returns: v.object({
		canceledSubscriptionIds: v.array(v.string()),
	}),
	handler: async (ctx) => {
		if (process.env.ALLOW_BILLING_RESET !== "true") {
			throw new ConvexError({
				code: "FORBIDDEN",
				message:
					"Billing reset is disabled. Set ALLOW_BILLING_RESET=true in Convex environment variables (dev only).",
			});
		}

		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in.",
			});
		}

		const userId = identity.subject;
		const stripe = new Stripe(requireSecretKey());
		const canceledSubscriptionIds: string[] = [];

		const customer = await ctx.runQuery(
			components.stripe.public.getCustomerByUserId,
			{ userId },
		);

		if (customer) {
			const { data: subscriptions } = await stripe.subscriptions.list({
				customer: customer.stripeCustomerId,
				status: "all",
				limit: 20,
			});

			for (const subscription of subscriptions) {
				if (
					subscription.status === "canceled" ||
					subscription.status === "incomplete_expired"
				) {
					continue;
				}
				const canceled = await stripe.subscriptions.cancel(subscription.id);
				canceledSubscriptionIds.push(canceled.id);
			}
		}

		await ctx.runMutation(internal.stripe.mutations.clearPendingPlanChange, {
			clerkUserId: userId,
		});
		await ctx.runMutation(internal.stripe.mutations.mirrorSubscriptionStatus, {
			clerkUserId: userId,
			stripeCustomerId: customer?.stripeCustomerId,
			stripeStatus: "canceled",
		});

		return { canceledSubscriptionIds };
	},
});
