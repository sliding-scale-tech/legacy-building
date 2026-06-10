"use node";

import { createClerkClient } from "@clerk/backend";
import { ConvexError, v } from "convex/values";
import Stripe from "stripe";

import { components, internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { action, internalAction } from "../_generated/server";
import { tombstoneStripeComponentCustomer } from "../stripe/customerHelpers";
import { requireStripeSecretKey } from "../stripe/helpers";

/** Cancel every Stripe subscription and remove the customer record. */
async function cancelStripeBillingForClerkUser(
	ctx: ActionCtx,
	clerkUserId: string,
): Promise<void> {
	let stripe: Stripe;
	try {
		stripe = new Stripe(requireStripeSecretKey());
	} catch {
		return;
	}

	const customer = await ctx.runQuery(
		components.stripe.public.getCustomerByUserId,
		{ userId: clerkUserId },
	);

	if (!customer) return;

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
		await stripe.subscriptions.cancel(subscription.id);
	}

	try {
		await stripe.customers.del(customer.stripeCustomerId);
	} catch (err) {
		console.warn("Failed to delete Stripe customer:", err);
	}

	await tombstoneStripeComponentCustomer(
		ctx,
		customer.stripeCustomerId,
		clerkUserId,
	);
}

async function deleteClerkAuthUser(clerkId: string): Promise<void> {
	const secretKey = process.env.CLERK_SECRET_KEY;
	if (!secretKey) {
		throw new ConvexError({
			code: "CLERK_NOT_CONFIGURED",
			message: "Account deletion is not configured. Please contact support.",
		});
	}

	const clerk = createClerkClient({ secretKey });
	await clerk.users.deleteUser(clerkId);
}

/** Remove Stripe billing and all Convex journals, entries, and user rows. */
async function purgeClerkUserRecords(
	ctx: ActionCtx,
	clerkId: string,
): Promise<void> {
	await cancelStripeBillingForClerkUser(ctx, clerkId);
	await ctx.runMutation(internal.user.mutations.deleteByClerkId, { clerkId });
}

/** Permanently delete the signed-in user's billing, journals, and Convex profile. */
export const deleteMyAccount = action({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to delete your account.",
			});
		}

		const clerkId = identity.subject;

		// Cancel billing first while the user row still exists for lookups.
		await cancelStripeBillingForClerkUser(ctx, clerkId);
		// Delete Clerk before Convex so a failed client session cannot recreate a
		// fresh Convex user via ensureCurrentUser while deletion is in progress.
		await deleteClerkAuthUser(clerkId);
		await ctx.runMutation(internal.user.mutations.deleteByClerkId, { clerkId });

		return null;
	},
});

/** Internal: full purge when Clerk emits `user.deleted` (or admin-driven removal). */
export const purgeClerkUserById = internalAction({
	args: { clerkId: v.string() },
	returns: v.null(),
	handler: async (ctx, { clerkId }) => {
		await purgeClerkUserRecords(ctx, clerkId);
		return null;
	},
});
