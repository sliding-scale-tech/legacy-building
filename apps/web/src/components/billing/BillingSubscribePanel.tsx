import { assets } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Check, Circle, Loader2 } from "lucide-react";

import { useBillingCheckout } from "@/hooks/useBillingCheckout";
import {
	BILLING_FEATURES,
	buildTrialSteps,
} from "@/lib/billing/billingContent";
import { formatAmount } from "@/lib/billing/plans";
import { ROUTES } from "@/lib/routes";

function PlanRadio({ selected }: { selected: boolean }) {
	return (
		<span
			className={cn(
				"flex size-5 shrink-0 items-center justify-center rounded-full border-2 bg-background",
				selected ? "border-primary" : "border-border",
			)}
			aria-hidden
		>
			{selected ? <span className="size-2.5 rounded-full bg-primary" /> : null}
		</span>
	);
}

type PlanCardProps = {
	selected: boolean;
	onSelect: () => void;
	isCurrent: boolean;
	children: React.ReactNode;
	badge?: string;
};

function PlanCard({
	selected,
	onSelect,
	isCurrent,
	children,
	badge,
}: PlanCardProps) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"relative flex w-full cursor-pointer flex-col gap-1 rounded-xl border px-4 py-4 text-left transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
				selected
					? "border-2 border-primary bg-card shadow-sm"
					: "border-border bg-card hover:border-muted-foreground/40",
			)}
			aria-pressed={selected}
		>
			{badge ? (
				<span className="absolute top-3 right-3 rounded-full bg-[#e8913a] px-2.5 py-1 font-semibold text-[10px] text-white uppercase tracking-wide">
					{badge}
				</span>
			) : null}
			<div className="flex items-start gap-3 pr-16">
				<PlanRadio selected={selected} />
				<div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
			</div>
			{isCurrent ? (
				<span className="mt-1 pl-8 text-muted-foreground text-xs">
					Current plan
				</span>
			) : null}
		</button>
	);
}

export function BillingSubscribePanel() {
	const {
		monthlyProduct,
		annualProduct,
		selected,
		setSelected,
		pending,
		isCurrentChoice,
		checkout,
		ctaLabel,
		isLoading,
		hasActiveSub,
	} = useBillingCheckout();

	const ctaDisabled = pending || (hasActiveSub && isCurrentChoice(selected));

	const monthlyPrice = monthlyProduct
		? formatAmount(monthlyProduct.amountCents, monthlyProduct.currency)
		: "$3.99";
	const annualPrice = annualProduct
		? formatAmount(annualProduct.amountCents, annualProduct.currency)
		: "$29.99";
	const trialDays = monthlyProduct?.trialDays ?? 7;
	const annualMonthly =
		annualProduct != null
			? formatAmount(
					Math.round(annualProduct.amountCents / 12),
					annualProduct.currency,
				)
			: "$2.51";
	const trialSteps = buildTrialSteps(monthlyPrice);

	return (
		<div className="mx-auto flex w-full max-w-[960px] flex-col items-center gap-8">
			<div className="flex flex-col items-center gap-4 text-center">
				<img
					src={assets.logo}
					alt="Legacy Building"
					className="h-10 w-auto object-contain"
				/>
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-3xl text-foreground leading-tight sm:text-[32px]">
						Unlock your full legacy experience
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Start free today — write, record, and preserve your story
					</p>
				</div>
			</div>

			<div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
				<div className="flex flex-col gap-3">
					{isLoading ? (
						<>
							<div className="h-[88px] animate-pulse rounded-xl bg-muted" />
							<div className="h-[72px] animate-pulse rounded-xl bg-muted" />
							<div className="h-[72px] animate-pulse rounded-xl bg-muted" />
						</>
					) : (
						<>
							<PlanCard
								selected={selected === "trial"}
								onSelect={() => setSelected("trial")}
								isCurrent={isCurrentChoice("trial")}
								badge="Most popular"
							>
								<p className="font-semibold text-base text-foreground">
									{trialDays} days free
								</p>
								<p className="text-muted-foreground text-xs leading-relaxed">
									Then {monthlyPrice}/mo — cancel anytime before day {trialDays}
								</p>
							</PlanCard>

							<PlanCard
								selected={selected === "monthly"}
								onSelect={() => setSelected("monthly")}
								isCurrent={isCurrentChoice("monthly")}
							>
								<div className="flex items-baseline justify-between gap-2">
									<p className="font-semibold text-base text-foreground">
										Monthly
									</p>
									<p className="font-semibold text-base text-foreground">
										{monthlyPrice}/mo
									</p>
								</div>
								<p className="text-muted-foreground text-xs">
									Full access from day one — no trial
								</p>
							</PlanCard>

							<PlanCard
								selected={selected === "annual"}
								onSelect={() => setSelected("annual")}
								isCurrent={isCurrentChoice("annual")}
							>
								<div className="flex items-baseline justify-between gap-2">
									<p className="font-semibold text-base text-foreground">
										Annual
									</p>
									<p className="font-semibold text-base text-foreground">
										{annualPrice}/yr
									</p>
								</div>
								<p className="text-muted-foreground text-xs">
									Save 37% — just {annualMonthly}/month
								</p>
							</PlanCard>
						</>
					)}
				</div>

				<div className="flex flex-col gap-5">
					<p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.12em]">
						Everything included
					</p>
					<ul className="flex flex-col gap-5">
						{BILLING_FEATURES.map((feature) => (
							<li key={feature.title} className="flex gap-3">
								<span
									className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10"
									aria-hidden
								>
									<feature.icon className="size-4 text-primary" aria-hidden />
								</span>
								<div className="flex flex-col gap-0.5">
									<span className="font-medium text-foreground text-sm">
										{feature.title}
									</span>
									<span className="text-muted-foreground text-xs leading-relaxed">
										{feature.description}
									</span>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="w-full max-w-[720px] rounded-2xl border border-border bg-card px-5 py-6 shadow-sm sm:px-8">
				<p className="mb-5 text-center font-medium text-muted-foreground text-xs uppercase tracking-[0.12em]">
					How your trial works
				</p>
				<div className="relative flex items-start justify-between gap-2">
					<div
						className="absolute top-[11px] right-[8%] left-[8%] h-px bg-border"
						aria-hidden
					/>
					{trialSteps.map((step) => (
						<div
							key={step.label}
							className="relative z-10 flex flex-1 flex-col items-center gap-2 text-center"
						>
							<span
								className={cn(
									"flex size-6 items-center justify-center rounded-full border-2",
									step.done
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-card text-transparent",
								)}
							>
								{step.done ? (
									<Check className="size-3.5" strokeWidth={3} aria-hidden />
								) : (
									<Circle className="size-2.5 text-border" aria-hidden />
								)}
							</span>
							<span className="font-medium text-foreground text-xs">
								{step.label}
							</span>
							<span className="max-w-[120px] text-[10px] text-muted-foreground leading-snug sm:text-xs">
								{step.description}
							</span>
						</div>
					))}
				</div>
				<p className="mt-6 text-center text-[10px] text-muted-foreground leading-relaxed sm:text-xs">
					Free for {trialDays} days, then {monthlyPrice}/month. Payment will be
					charged to your account at the end of the free trial. Your
					subscription automatically renews unless cancelled at least 24 hours
					before the end of the trial or current period. Printed books are
					ordered separately, starting from $10. Your subscription unlocks the
					feature to create and order them.
				</p>
			</div>

			<div className="relative z-10 flex w-full max-w-[480px] flex-col items-center gap-3">
				{!hasActiveSub ? (
					<Link
						to={ROUTES.dashboardBillingCheckout}
						search={{ plan: selected, flow: "subscribe" }}
						className={cn(
							"flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground text-sm",
							"transition-colors hover:bg-primary/90",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
						)}
					>
						{ctaLabel}
					</Link>
				) : (
					<button
						type="button"
						onClick={() => void checkout()}
						disabled={ctaDisabled}
						className={cn(
							"flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground text-sm",
							"transition-colors hover:bg-primary/90",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
							!ctaDisabled && "cursor-pointer",
							"disabled:cursor-not-allowed disabled:opacity-60",
						)}
					>
						{pending ? (
							<>
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Redirecting…
							</>
						) : (
							ctaLabel
						)}
					</button>
				)}
				{!hasActiveSub && selected === "trial" ? (
					<p className="text-center text-muted-foreground text-xs">
						No charge today — cancel anytime before day {trialDays}
					</p>
				) : null}
				<Link
					to={ROUTES.terms}
					className="text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
				>
					Terms of subscription
				</Link>
			</div>
		</div>
	);
}
