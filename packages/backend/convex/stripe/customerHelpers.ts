"use node";

import { StripeSubscriptions } from "@convex-dev/stripe";
import Stripe from "stripe";

import { components } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { requireStripeSecretKey } from "./helpers";

const stripeSubscriptions = new StripeSubscriptions(components.stripe, {});

export function isStripeResourceMissing(error: unknown): boolean {
	return (
		error instanceof Stripe.errors.StripeInvalidRequestError &&
		(error.code === "resource_missing" || error.statusCode === 404)
	);
}

function isStripeMissingCustomer(error: unknown): boolean {
	return isStripeResourceMissing(error);
}

function isDeletedStripeCustomer(
	customer: Stripe.Customer | Stripe.DeletedCustomer,
): boolean {
	return "deleted" in customer && customer.deleted === true;
}

async function stripeCustomerIsUsable(
	stripe: Stripe,
	customerId: string,
): Promise<boolean> {
	try {
		const customer = await stripe.customers.retrieve(customerId);
		return !isDeletedStripeCustomer(customer);
	} catch (error) {
		if (isStripeMissingCustomer(error)) {
			return false;
		}
		throw error;
	}
}

/** Break email-based customer reuse after the Stripe customer has been removed. */
export async function tombstoneStripeComponentCustomer(
	ctx: ActionCtx,
	stripeCustomerId: string,
	clerkUserId: string,
): Promise<void> {
	await ctx.runMutation(components.stripe.public.createOrUpdateCustomer, {
		stripeCustomerId,
		email: `deleted-${Date.now()}-${stripeCustomerId}@removed.invalid`,
		metadata: { deleted: "true", previousUserId: clerkUserId },
	});
}

/**
 * Resolve a live Stripe customer for checkout. The Stripe component may still
 * reference a deleted customer (e.g. after account deletion); verify in Stripe
 * and create a fresh customer when the cached id is stale.
 */
export async function scrubStaleComponentCustomers(
	ctx: ActionCtx,
	stripe: Stripe,
	args: { userId: string; email?: string },
): Promise<void> {
	const cached = await ctx.runQuery(
		components.stripe.public.getCustomerByUserId,
		{ userId: args.userId },
	);

	if (
		cached &&
		!(await stripeCustomerIsUsable(stripe, cached.stripeCustomerId))
	) {
		await tombstoneStripeComponentCustomer(
			ctx,
			cached.stripeCustomerId,
			args.userId,
		);
	}

	if (args.email) {
		const byEmail = await ctx.runQuery(
			components.stripe.public.getCustomerByEmail,
			{ email: args.email },
		);
		if (
			byEmail &&
			!(await stripeCustomerIsUsable(stripe, byEmail.stripeCustomerId))
		) {
			await tombstoneStripeComponentCustomer(
				ctx,
				byEmail.stripeCustomerId,
				args.userId,
			);
		}
	}
}

/** Stripe component row for the user, or null when missing / deleted in Stripe. */
export async function getUsableStripeCustomer(
	ctx: ActionCtx,
	args: { userId: string; email?: string },
): Promise<{ stripeCustomerId: string } | null> {
	const stripe = new Stripe(requireStripeSecretKey());
	await scrubStaleComponentCustomers(ctx, stripe, args);

	const customer = await ctx.runQuery(
		components.stripe.public.getCustomerByUserId,
		{ userId: args.userId },
	);
	if (!customer) return null;

	if (!(await stripeCustomerIsUsable(stripe, customer.stripeCustomerId))) {
		await tombstoneStripeComponentCustomer(
			ctx,
			customer.stripeCustomerId,
			args.userId,
		);
		return null;
	}

	return { stripeCustomerId: customer.stripeCustomerId };
}

export async function getOrCreateValidStripeCustomer(
	ctx: ActionCtx,
	args: { userId: string; email?: string; name?: string },
): Promise<{ customerId: string }> {
	const stripe = new Stripe(requireStripeSecretKey());
	await scrubStaleComponentCustomers(ctx, stripe, args);

	const { customerId } = await stripeSubscriptions.getOrCreateCustomer(
		ctx,
		args,
	);

	if (await stripeCustomerIsUsable(stripe, customerId)) {
		return { customerId };
	}

	await tombstoneStripeComponentCustomer(ctx, customerId, args.userId);

	const fresh = await stripeSubscriptions.createCustomer(ctx, {
		email: args.email,
		name: args.name,
		metadata: { userId: args.userId },
		idempotencyKey: `${args.userId}-recovery-${Date.now()}`,
	});

	return { customerId: fresh.customerId };
}
