import { cn } from "@legacy-building/ui/lib/utils";
import { Check } from "lucide-react";

import type { BillingPlanChoice } from "@/lib/billing/billingContent";
import { BILLING_FEATURES } from "@/lib/billing/billingContent";
import { formatAmount } from "@/lib/billing/plans";

type ProductSummary = {
	name: string;
	amountCents: number;
	currency: string;
	interval: "monthly" | "annual";
	trialDays: number;
};

type CheckoutOrderSummaryProps = {
	plan: BillingPlanChoice;
	onPlanChange: (plan: BillingPlanChoice) => void;
	monthlyProduct?: ProductSummary;
	annualProduct?: ProductSummary;
	hideTrial?: boolean;
};

const SUMMARY_FEATURES = BILLING_FEATURES.slice(0, 5);

const segmentButtonClass =
	"rounded-full px-4 py-1.5 font-medium text-sm transition-[color,background-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2";

export function CheckoutOrderSummary({
	plan,
	onPlanChange,
	monthlyProduct,
	annualProduct,
	hideTrial = false,
}: CheckoutOrderSummaryProps) {
	const isAnnual = plan === "annual";
	const isTrial = !hideTrial && plan === "trial";
	const activeProduct = isAnnual ? annualProduct : monthlyProduct;
	const displayPrice = activeProduct
		? formatAmount(activeProduct.amountCents, activeProduct.currency)
		: isAnnual
			? "$29.99"
			: "$3.99";
	const intervalSuffix = isAnnual ? "/ year" : "/ month";
	const dueToday =
		isTrial || !activeProduct
			? "$0.00"
			: formatAmount(activeProduct.amountCents, activeProduct.currency);

	return (
		<div className="flex flex-col gap-6">
			<h2 className="font-semibold text-foreground text-xl">Order Summary</h2>

			<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
				<div className="mb-4 flex items-center gap-2">
					<h3 className="font-semibold text-foreground text-lg">
						{isAnnual ? "Annual Plan" : "Monthly Plan"}
					</h3>
					{isTrial ? (
						<span className="rounded-full bg-primary px-2.5 py-0.5 font-medium text-primary-foreground text-xs">
							Recommended
						</span>
					) : null}
				</div>

				<p className="mb-4 font-semibold text-3xl text-foreground">
					{displayPrice}
					<span className="font-normal text-base text-muted-foreground">
						{intervalSuffix}
					</span>
				</p>

				<ul className="mb-5 flex flex-col gap-2.5">
					{SUMMARY_FEATURES.map((feature) => (
						<li
							key={feature.title}
							className="flex items-start gap-2 text-foreground text-sm"
						>
							<Check
								className="mt-0.5 size-4 shrink-0 text-primary"
								aria-hidden
							/>
							<span>{feature.title}</span>
						</li>
					))}
				</ul>

				<div className="inline-flex rounded-full border border-border bg-muted p-1">
					<button
						type="button"
						onClick={() =>
							onPlanChange(
								hideTrial
									? "monthly"
									: plan === "monthly"
										? "monthly"
										: "trial",
							)
						}
						className={cn(
							segmentButtonClass,
							!isAnnual
								? "bg-card text-foreground shadow-sm"
								: "text-muted-foreground hover:bg-card/60 hover:text-foreground",
						)}
					>
						Monthly
					</button>
					<button
						type="button"
						onClick={() => onPlanChange("annual")}
						className={cn(
							segmentButtonClass,
							"inline-flex items-center gap-1.5",
							isAnnual
								? "bg-card text-foreground shadow-sm"
								: "text-muted-foreground hover:bg-card/60 hover:text-foreground",
						)}
					>
						Yearly
						<span className="rounded-full bg-green-500 px-1.5 py-0.5 font-semibold text-[10px] text-white">
							Save 37%
						</span>
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-2 text-sm">
				<div className="flex items-center justify-between text-muted-foreground">
					<span>Subtotal</span>
					<span>{displayPrice}</span>
				</div>
				<div className="flex items-center justify-between text-muted-foreground">
					<span>Taxes</span>
					<span>Calculated accordingly</span>
				</div>
				<div className="mt-1 flex items-center justify-between font-semibold text-foreground">
					<span>Total Due Today</span>
					<span>{dueToday}</span>
				</div>
			</div>
		</div>
	);
}
