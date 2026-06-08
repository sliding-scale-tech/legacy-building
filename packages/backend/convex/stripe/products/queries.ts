import { v } from "convex/values";
import { internalQuery, query } from "../../_generated/server";
import { planIntervalValidator } from "../../schema";

/** Active products for the pricing UI, ordered by `sortOrder`. */
export const listActive = query({
	args: {},
	handler: async (ctx) => {
		const products = await ctx.db
			.query("products")
			.withIndex("by_active_and_sort", (q) => q.eq("active", true))
			.collect();

		return products
			.sort((a, b) => a.sortOrder - b.sortOrder)
			.map((product) => ({
				_id: product._id,
				interval: product.interval,
				name: product.name,
				stripePriceId: product.stripePriceId,
				amountCents: product.amountCents,
				currency: product.currency,
				trialDays: product.trialDays,
				features: product.features,
				tagline: product.tagline ?? null,
				highlight: product.highlight ?? null,
			}));
	},
});

/** Resolve the active product for a billing interval (internal: checkout/changePlan). */
export const getByInterval = internalQuery({
	args: { interval: planIntervalValidator },
	handler: async (ctx, { interval }) => {
		const products = await ctx.db
			.query("products")
			.withIndex("by_interval", (q) => q.eq("interval", interval))
			.collect();
		return products.find((p) => p.active) ?? null;
	},
});

/** Reverse-map a Stripe Price ID to a product (internal: subscription display). */
export const getByStripePriceId = internalQuery({
	args: { stripePriceId: v.string() },
	handler: async (ctx, { stripePriceId }) => {
		return await ctx.db
			.query("products")
			.withIndex("by_stripe_price_id", (q) =>
				q.eq("stripePriceId", stripePriceId),
			)
			.unique();
	},
});
