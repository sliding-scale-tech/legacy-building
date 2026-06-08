import { components } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

export type ComponentSubscription = {
	stripeSubscriptionId: string;
	stripeCustomerId: string;
	status: string;
	priceId: string;
	quantity?: number;
	currentPeriodEnd: number;
	cancelAtPeriodEnd: boolean;
	cancelAt?: number;
	userId?: string;
};

/** Statuses we treat as a live subscription the user can manage/change. */
const MANAGEABLE_STATUSES = new Set(["active", "trialing", "past_due"]);

/**
 * Find the user's current manageable subscription (active, trialing, or past due),
 * reading from the Stripe component's synced tables. Returns `null` when none.
 */
export async function getActiveSubscriptionForUser(
	ctx: ActionCtx,
	clerkUserId: string,
): Promise<ComponentSubscription | null> {
	const subscriptions: ComponentSubscription[] = await ctx.runQuery(
		components.stripe.public.listSubscriptionsByUserId,
		{ userId: clerkUserId },
	);

	const manageable = subscriptions.filter((s) =>
		MANAGEABLE_STATUSES.has(s.status),
	);
	if (manageable.length === 0) return null;

	// Prefer the subscription with the furthest period end (the live one).
	return manageable.sort((a, b) => b.currentPeriodEnd - a.currentPeriodEnd)[0];
}

/** Require the Stripe secret key from the Convex environment. */
export function requireStripeSecretKey(): string {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) {
		throw new Error(
			"Billing is not configured. Set STRIPE_SECRET_KEY in your Convex environment variables.",
		);
	}
	return key;
}
