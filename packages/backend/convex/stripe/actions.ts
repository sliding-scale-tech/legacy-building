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
	},
): Promise<string> {
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
			...(args.product.trialDays > 0
				? { trial_period_days: args.product.trialDays }
				: {}),
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
		});

		return { url };
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
		if (!subscription || subscription.status !== "trialing") {
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
