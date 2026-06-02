import { StripeSubscriptions } from "@convex-dev/stripe";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { action, query } from "./_generated/server";

const stripeClient = new StripeSubscriptions(components.stripe, {});

export const createSubscriptionCheckout = action({
	args: {
		priceId: v.string(),
		successUrl: v.string(),
		cancelUrl: v.string(),
	},
	returns: v.object({
		sessionId: v.string(),
		url: v.union(v.string(), v.null()),
	}),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in.",
			});
		}

		const customer = await stripeClient.getOrCreateCustomer(ctx, {
			userId: identity.subject,
			email: identity.email,
			name: identity.name,
		});

		return await stripeClient.createCheckoutSession(ctx, {
			priceId: args.priceId,
			customerId: customer.customerId,
			mode: "subscription",
			successUrl: args.successUrl,
			cancelUrl: args.cancelUrl,
			subscriptionMetadata: { userId: identity.subject },
		});
	},
});

export const createPaymentCheckout = action({
	args: {
		priceId: v.string(),
		successUrl: v.string(),
		cancelUrl: v.string(),
	},
	returns: v.object({
		sessionId: v.string(),
		url: v.union(v.string(), v.null()),
	}),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in.",
			});
		}

		const customer = await stripeClient.getOrCreateCustomer(ctx, {
			userId: identity.subject,
			email: identity.email,
			name: identity.name,
		});

		return await stripeClient.createCheckoutSession(ctx, {
			priceId: args.priceId,
			customerId: customer.customerId,
			mode: "payment",
			successUrl: args.successUrl,
			cancelUrl: args.cancelUrl,
			paymentIntentMetadata: { userId: identity.subject },
		});
	},
});

export const createCustomerPortalSession = action({
	args: {
		returnUrl: v.string(),
	},
	returns: v.object({
		url: v.union(v.string(), v.null()),
	}),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in.",
			});
		}

		const customer = await stripeClient.getOrCreateCustomer(ctx, {
			userId: identity.subject,
			email: identity.email,
			name: identity.name,
		});

		return await stripeClient.createCustomerPortalSession(ctx, {
			customerId: customer.customerId,
			returnUrl: args.returnUrl,
		});
	},
});

export const getUserSubscriptions = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		return await ctx.runQuery(
			components.stripe.public.listSubscriptionsByUserId,
			{ userId: identity.subject },
		);
	},
});

export const getUserPayments = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		return await ctx.runQuery(components.stripe.public.listPaymentsByUserId, {
			userId: identity.subject,
		});
	},
});

export const getUserInvoices = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		return await ctx.runQuery(components.stripe.public.listInvoicesByUserId, {
			userId: identity.subject,
		});
	},
});
