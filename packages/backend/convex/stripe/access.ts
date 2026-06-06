import { ConvexError } from "convex/values";

import { components } from "../_generated/api";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { AppSubscriptionStatus } from "./config";

/** Statuses that unlock paid plan features (first charge completed). */
const PAID_FEATURE_STATUSES = new Set<AppSubscriptionStatus>([
	"active",
	"grace_period",
]);

type AccessCtx = QueryCtx | MutationCtx;

export async function userHasPaidFeatureAccess(
	ctx: AccessCtx,
	clerkUserId: string,
): Promise<boolean> {
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
		.unique();

	if (!user) return false;
	if (user.role === "admin") return true;

	if (
		user.subscriptionStatus &&
		PAID_FEATURE_STATUSES.has(user.subscriptionStatus)
	) {
		return true;
	}

	const subscriptions = await ctx.runQuery(
		components.stripe.public.listSubscriptionsByUserId,
		{ userId: clerkUserId },
	);

	return subscriptions.some(
		(subscription) =>
			subscription.status === "active" || subscription.status === "past_due",
	);
}

export async function requirePaidFeatureAccess(
	ctx: AccessCtx,
	clerkUserId: string,
): Promise<void> {
	if (await userHasPaidFeatureAccess(ctx, clerkUserId)) return;

	throw new ConvexError({
		code: "SUBSCRIPTION_REQUIRED",
		message:
			"Subscribe and complete payment to use journal features. Visit Billing to continue.",
	});
}
