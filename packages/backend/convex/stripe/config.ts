/** Billing intervals offered to users. Mirrors the `products` table `interval`. */
export type PlanInterval = "monthly" | "annual";

/** App-facing subscription status mirrored onto the `users` table. */
export type AppSubscriptionStatus =
	| "active"
	| "trialing"
	| "grace_period"
	| "canceled"
	| "none";

/** Translate a raw Stripe subscription status into the app's status enum. */
export function mapStripeStatus(status: string): AppSubscriptionStatus {
	switch (status) {
		case "trialing":
			return "trialing";
		case "active":
			return "active";
		case "past_due":
		case "unpaid":
			return "grace_period";
		case "canceled":
		case "incomplete_expired":
			return "canceled";
		default:
			return "none";
	}
}
