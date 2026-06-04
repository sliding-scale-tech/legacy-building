import { components } from "../_generated/api";
import { query } from "../_generated/server";

type ComponentSubscription = {
	stripeSubscriptionId: string;
	stripeCustomerId: string;
	status: string;
	priceId: string;
	quantity?: number;
	currentPeriodEnd: number;
	cancelAtPeriodEnd: boolean;
	cancelAt?: number;
};

/** Lower is more relevant when picking the subscription to surface in the UI. */
function statusRank(status: string): number {
	switch (status) {
		case "active":
		case "trialing":
			return 0;
		case "past_due":
		case "unpaid":
			return 1;
		default:
			return 2;
	}
}

/**
 * The current user's most relevant subscription, enriched with plan details from
 * the `products` table. Reads billing data from the Stripe component's synced tables.
 */
export const getMySubscription = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		const customer = await ctx.runQuery(
			components.stripe.public.getCustomerByUserId,
			{ userId: identity.subject },
		);
		if (!customer) return null;

		const subscriptions: ComponentSubscription[] = await ctx.runQuery(
			components.stripe.public.listSubscriptions,
			{ stripeCustomerId: customer.stripeCustomerId },
		);
		if (subscriptions.length === 0) return null;

		const [subscription] = [...subscriptions].sort(
			(a, b) =>
				statusRank(a.status) - statusRank(b.status) ||
				b.currentPeriodEnd - a.currentPeriodEnd,
		);
		if (!subscription) return null;

		const product = await ctx.db
			.query("products")
			.withIndex("by_stripe_price_id", (q) =>
				q.eq("stripePriceId", subscription.priceId),
			)
			.unique();

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		// Suppress a pending plan change once the subscription already moved to it.
		const pending = user?.pendingPlanChange ?? null;
		const pendingPlanChange =
			pending && product && pending.interval !== product.interval
				? pending
				: null;

		return {
			stripeSubscriptionId: subscription.stripeSubscriptionId,
			status: subscription.status,
			interval: product?.interval ?? null,
			priceId: subscription.priceId,
			/** Stripe epoch seconds. */
			currentPeriodEnd: subscription.currentPeriodEnd,
			cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
			cancelAt: subscription.cancelAt ?? null,
			plan: product
				? {
						name: product.name,
						amountCents: product.amountCents,
						currency: product.currency,
						trialDays: product.trialDays,
						features: product.features,
					}
				: null,
			pendingPlanChange,
		};
	},
});

/** The current user's invoices, newest first (amounts are in the smallest currency unit). */
export const listMyInvoices = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		const customer = await ctx.runQuery(
			components.stripe.public.getCustomerByUserId,
			{ userId: identity.subject },
		);
		if (!customer) return [];

		const invoices = await ctx.runQuery(components.stripe.public.listInvoices, {
			stripeCustomerId: customer.stripeCustomerId,
		});

		return [...invoices]
			.sort((a, b) => b.created - a.created)
			.map((invoice) => ({
				stripeInvoiceId: invoice.stripeInvoiceId,
				created: invoice.created,
				amountDue: invoice.amountDue,
				amountPaid: invoice.amountPaid,
				status: invoice.status,
				stripeSubscriptionId: invoice.stripeSubscriptionId ?? null,
			}));
	},
});
