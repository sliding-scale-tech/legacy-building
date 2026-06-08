import { z } from "zod";

import type { BillingPlanChoice } from "@/lib/billing/billingContent";

export const checkoutSearchSchema = z.object({
	plan: z.enum(["trial", "monthly", "annual"]).default("trial"),
	flow: z.enum(["subscribe", "upgrade"]).default("subscribe"),
});

export type CheckoutSearch = z.infer<typeof checkoutSearchSchema>;
export type CheckoutFlow = CheckoutSearch["flow"];

export function planToCheckoutArgs(plan: BillingPlanChoice): {
	interval: "monthly" | "annual";
	skipTrial: boolean;
} {
	return {
		interval: plan === "annual" ? "annual" : "monthly",
		skipTrial: plan === "monthly",
	};
}
