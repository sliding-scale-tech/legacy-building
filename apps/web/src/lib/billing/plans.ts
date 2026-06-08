export type PlanInterval = "monthly" | "annual";

/** "/month" or "/year" suffix for a billing interval. */
export function intervalSuffix(interval: PlanInterval): string {
	return interval === "annual" ? "/year" : "/month";
}

/** Capitalized interval label, e.g. "Monthly". */
export function intervalLabel(interval: PlanInterval): string {
	return interval === "annual" ? "Annual" : "Monthly";
}

/** Format a smallest-currency-unit amount (cents) as a currency string. */
export function formatAmount(amountCents: number, currency = "usd"): string {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: currency.toUpperCase(),
		minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
	}).format(amountCents / 100);
}
