import { brand } from "@legacy-building/ui/lib/brand-journal";
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
			<h2 className="font-semibold text-[#1a1a1a] text-xl">Order Summary</h2>

			<div className="rounded-2xl border border-[#e6e6e6] bg-white p-5 shadow-sm">
				<div className="mb-4 flex items-center gap-2">
					<h3 className="font-semibold text-[#1a1a1a] text-lg">
						{isAnnual ? "Annual Plan" : "Monthly Plan"}
					</h3>
					{isTrial ? (
						<span
							className="rounded-full px-2.5 py-0.5 font-medium text-white text-xs"
							style={{ backgroundColor: brand.primary }}
						>
							Recommended
						</span>
					) : null}
				</div>

				<p className="mb-4 font-semibold text-3xl text-[#1a1a1a]">
					{displayPrice}
					<span className="font-normal text-[#8a8a8a] text-base">
						{intervalSuffix}
					</span>
				</p>

				<ul className="mb-5 flex flex-col gap-2.5">
					{SUMMARY_FEATURES.map((feature) => (
						<li
							key={feature.title}
							className="flex items-start gap-2 text-[#1a1a1a] text-sm"
						>
							<Check
								className="mt-0.5 size-4 shrink-0"
								style={{ color: brand.primary }}
								aria-hidden
							/>
							<span>{feature.title}</span>
						</li>
					))}
				</ul>

				<div className="inline-flex rounded-full border border-[#e6e6e6] bg-[#f7f7f7] p-1">
					<button
						type="button"
						onClick={() =>
							onPlanChange(plan === "monthly" ? "monthly" : "trial")
						}
						className={cn(
							"rounded-full px-4 py-1.5 font-medium text-sm transition-colors",
							!isAnnual
								? "bg-white text-[#1a1a1a] shadow-sm"
								: "text-[#8a8a8a]",
						)}
					>
						Monthly
					</button>
					<button
						type="button"
						onClick={() => onPlanChange("annual")}
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium text-sm transition-colors",
							isAnnual ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#8a8a8a]",
						)}
					>
						Yearly
						<span className="rounded-full bg-[#22c55e] px-1.5 py-0.5 font-semibold text-[10px] text-white">
							Save 37%
						</span>
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-2 text-sm">
				<div className="flex items-center justify-between text-[#525252]">
					<span>Subtotal</span>
					<span>{displayPrice}</span>
				</div>
				<div className="flex items-center justify-between text-[#8a8a8a]">
					<span>Taxes</span>
					<span>Calculated accordingly</span>
				</div>
				<div className="mt-1 flex items-center justify-between font-semibold text-[#1a1a1a]">
					<span>Total Due Today</span>
					<span>{dueToday}</span>
				</div>
			</div>
		</div>
	);
}
