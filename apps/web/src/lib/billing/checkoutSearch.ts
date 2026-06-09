import { z } from "zod";

import type { BillingPlanChoice } from "@/lib/billing/billingContent";

export const checkoutSearchSchema = z.object({
	plan: z.enum(["trial", "monthly", "annual"]),
	flow: z.enum(["subscribe", "upgrade"]).default("subscribe"),
});

export type CheckoutSearch = z.infer<typeof checkoutSearchSchema>;
export type CheckoutFlow = CheckoutSearch["flow"];

export function planToCheckoutArgs(
	plan: BillingPlanChoice,
	returnUrl: string,
): {
	interval: "monthly" | "annual";
	skipTrial: boolean;
	returnUrl: string;
} {
	return {
		interval: plan === "annual" ? "annual" : "monthly",
		skipTrial: plan === "monthly",
		returnUrl,
	};
}
