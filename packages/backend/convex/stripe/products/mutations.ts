import { v } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import { internalMutation, type MutationCtx } from "../../_generated/server";
import type { PlanInterval } from "../config";

/** Default Stripe price IDs (override via args when running the seed). */
const DEFAULT_MONTHLY_PRICE_ID = "price_1Tef8O1GnOSmHyd23xOHRC65";
const DEFAULT_ANNUAL_PRICE_ID = "price_1Tef8O1GnOSmHyd2yUQPYnh9";

type SeedProduct = {
	interval: PlanInterval;
	name: string;
	stripePriceId: string;
	stripeProductId?: string;
	amountCents: number;
	currency: string;
	trialDays: number;
	features: string[];
	tagline?: string;
	highlight?: string;
	sortOrder: number;
	active: boolean;
};

async function upsertByInterval(ctx: MutationCtx, product: SeedProduct) {
	const existing = await ctx.db
		.query("products")
		.withIndex("by_interval", (q) => q.eq("interval", product.interval))
		.collect();

	let kept: Id<"products"> | null = null;

	for (const row of existing) {
		if (kept === null) {
			await ctx.db.patch(row._id, product);
			kept = row._id;
		} else {
			// Enforce a single product per interval.
			await ctx.db.delete(row._id);
		}
	}

	if (kept === null) {
		kept = await ctx.db.insert("products", product);
	}

	return kept;
}

/**
 * Idempotent seed for the monthly + annual plans. Safe to re-run; it upserts the
 * single product per interval and keeps copy/amounts in sync with the pricing UI.
 *
 * Run from the Convex dashboard (Functions -> stripe/products/mutations:seedInitialProducts).
 * Price IDs default to the project's Stripe prices but can be overridden.
 */
export const seedInitialProducts = internalMutation({
	args: {
		monthlyPriceId: v.optional(v.string()),
		annualPriceId: v.optional(v.string()),
		monthlyProductId: v.optional(v.string()),
		annualProductId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const monthlyId = await upsertByInterval(ctx, {
			interval: "monthly",
			name: "Monthly",
			stripePriceId: args.monthlyPriceId ?? DEFAULT_MONTHLY_PRICE_ID,
			stripeProductId: args.monthlyProductId,
			amountCents: 399,
			currency: "usd",
			trialDays: 7,
			features: [
				"7-day free trial",
				"Full access to every platform feature",
				"Automatic renewal after the trial period",
				"Cancel anytime from your billing page",
			],
			tagline: "7-day free trial, cancel anytime.",
			sortOrder: 0,
			active: true,
		});

		const annualId = await upsertByInterval(ctx, {
			interval: "annual",
			name: "Annual",
			stripePriceId: args.annualPriceId ?? DEFAULT_ANNUAL_PRICE_ID,
			stripeProductId: args.annualProductId,
			amountCents: 2999,
			currency: "usd",
			trialDays: 0,
			features: [
				"Approximately 37% savings vs. monthly",
				"Full access to every platform feature",
				"Automatic annual renewal",
				"Cancel anytime from your billing page",
			],
			tagline: "Save ~37% versus monthly billing.",
			highlight: "Best value",
			sortOrder: 1,
			active: true,
		});

		return { monthlyId, annualId };
	},
});
