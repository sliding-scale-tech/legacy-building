import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { Dialog, DialogContent } from "@legacy-building/ui/components/dialog";
import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useAction, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	formatAmount,
	intervalSuffix,
	type PlanInterval,
} from "@/lib/billing/plans";
import { ROUTES } from "@/lib/routes";

function messageFromError(error: unknown): string {
	if (error instanceof ConvexError) {
		const data = error.data as { message?: string } | string | undefined;
		if (typeof data === "string") return data;
		if (data?.message) return data.message;
	}
	return "Something went wrong. Please try again.";
}

type PricingModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultPlan?: PlanInterval;
};

export function PricingModal({
	open,
	onOpenChange,
	defaultPlan = "annual",
}: PricingModalProps) {
	const products = useQuery(api.stripe.products.queries.listActive);
	const subscription = useQuery(api.stripe.queries.getMySubscription);
	const createCheckoutSession = useAction(
		api.stripe.actions.createCheckoutSession,
	);
	const createPlanChangeCheckout = useAction(
		api.stripe.actions.createPlanChangeCheckout,
	);
	const changePlan = useAction(api.stripe.actions.changePlan);

	const [selected, setSelected] = useState<PlanInterval>(defaultPlan);
	const [pending, setPending] = useState(false);

	const currentInterval =
		subscription &&
		(subscription.status === "active" ||
			subscription.status === "trialing" ||
			subscription.status === "past_due")
			? subscription.interval
			: null;

	// Default selection to a plan the user is not already on.
	useEffect(() => {
		if (currentInterval && currentInterval === selected) {
			setSelected(currentInterval === "annual" ? "monthly" : "annual");
		}
	}, [currentInterval, selected]);

	const hasActiveSub = currentInterval !== null;
	const isTrialing = subscription?.status === "trialing";
	const isCurrentPlan = currentInterval === selected;

	const billingReturnUrls = () => {
		const origin = window.location.origin;
		return {
			successUrl: `${origin}${ROUTES.dashboardBilling}?checkout=success`,
			cancelUrl: `${origin}${ROUTES.dashboardBilling}?checkout=canceled`,
		};
	};

	const handleContinue = async () => {
		if (pending || isCurrentPlan) return;
		setPending(true);
		try {
			if (hasActiveSub && isTrialing) {
				const { url } = await createPlanChangeCheckout({
					targetInterval: selected,
					...billingReturnUrls(),
				});
				window.location.href = url;
				return;
			}
			if (hasActiveSub) {
				const result = await changePlan({ targetInterval: selected });
				if (result.effect === "scheduled" && result.effectiveAt) {
					const date = new Date(result.effectiveAt * 1000).toLocaleDateString(
						undefined,
						{
							year: "numeric",
							month: "short",
							day: "numeric",
						},
					);
					toast.success(`Your plan switches to ${selected} on ${date}.`);
				} else {
					toast.success(`You're now on the ${selected} plan.`);
				}
				onOpenChange(false);
			} else {
				const { url } = await createCheckoutSession({
					interval: selected,
					...billingReturnUrls(),
				});
				window.location.href = url;
				return;
			}
		} catch (error) {
			toast.error(messageFromError(error));
		} finally {
			setPending(false);
		}
	};

	const ctaLabel = (() => {
		if (isCurrentPlan) return "Current plan";
		if (hasActiveSub && isTrialing) {
			return selected === "annual"
				? "Continue to payment"
				: "Continue to checkout";
		}
		if (hasActiveSub) {
			return selected === "annual" ? "Switch to annual" : "Switch to monthly";
		}
		return selected === "annual"
			? "Continue with annual"
			: "Start 7-day free trial";
	})();

	const isLoadingProducts = products === undefined;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"w-full max-w-[calc(100%-2rem)] gap-0 rounded-[24px] bg-white p-0 ring-0 sm:max-w-[860px]",
				)}
				overlayClassName="bg-black/40"
			>
				<div
					className="rounded-t-[24px] px-6 py-7 text-center sm:px-10"
					style={{ backgroundColor: brand.libraryMint }}
				>
					<DialogPrimitive.Title className="font-semibold text-2xl text-[#1a1a1a] leading-[1.2] sm:text-[28px]">
						{hasActiveSub ? "Change your plan" : "Choose your plan"}
					</DialogPrimitive.Title>
					<DialogPrimitive.Description className="mx-auto mt-2 max-w-md text-[#525252] text-sm leading-[1.5]">
						{isTrialing
							? "Your free trial ends when you continue. You'll complete checkout and pay for your new plan on Stripe."
							: hasActiveSub
								? "Switch between monthly and annual billing. Upgrades apply right away; downgrades take effect at your next renewal."
								: "Unlock full access to Legacy Building. Start with a 7-day free trial — cancel anytime from your billing page."}
					</DialogPrimitive.Description>
				</div>

				<div className="grid gap-4 px-5 py-6 sm:grid-cols-2 sm:gap-5 sm:px-8 sm:py-8">
					{isLoadingProducts
						? ["a", "b"].map((id) => (
								<div
									key={id}
									className="h-[280px] animate-pulse rounded-[20px] bg-[#f0f7f7]"
								/>
							))
						: products.map((plan) => {
								const isSelected = selected === plan.interval;
								const isPlanCurrent = currentInterval === plan.interval;
								return (
									<button
										type="button"
										key={plan._id}
										onClick={() => setSelected(plan.interval)}
										className={cn(
											"relative flex flex-col rounded-[20px] border-2 bg-white p-6 text-left transition-all",
											"focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/40",
											isSelected
												? "border-[#008080] shadow-[0_8px_24px_-12px_rgba(0,128,128,0.35)]"
												: "border-[#e6e6e6] hover:border-[#c7c7c7]",
										)}
									>
										{plan.highlight ? (
											<span
												className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-white text-xs"
												style={{ backgroundColor: brand.primary }}
											>
												<Sparkles className="size-3" aria-hidden />
												{plan.highlight}
											</span>
										) : null}

										<div className="flex flex-col gap-1">
											<span className="font-medium text-[#525252] text-sm uppercase tracking-wide">
												{plan.name}
												{isPlanCurrent ? (
													<span className="ml-2 text-[#008080] normal-case">
														Current
													</span>
												) : null}
											</span>
											<div className="flex items-baseline gap-1">
												<span className="font-semibold text-4xl text-[#1a1a1a] leading-none">
													{formatAmount(plan.amountCents, plan.currency)}
												</span>
												<span className="text-[#8a8a8a] text-sm">
													{intervalSuffix(plan.interval)}
												</span>
											</div>
											{plan.tagline ? (
												<p className="text-[#525252] text-sm">{plan.tagline}</p>
											) : null}
										</div>

										<ul className="mt-5 flex flex-col gap-2.5">
											{plan.features.map((feature) => (
												<li
													key={feature}
													className="flex items-start gap-2 text-[#1a1a1a] text-sm"
												>
													<Check
														className="mt-0.5 size-4 shrink-0"
														style={{ color: brand.primary }}
														aria-hidden
													/>
													<span>{feature}</span>
												</li>
											))}
										</ul>

										<div
											className={cn(
												"mt-5 inline-flex h-9 items-center justify-center self-start rounded-full px-3 font-medium text-xs",
												isSelected
													? "bg-[#008080] text-white"
													: "bg-[#f0f7f7] text-[#008080]",
											)}
										>
											{isSelected ? "Selected" : "Select plan"}
										</div>
									</button>
								);
							})}
				</div>

				<div className="flex flex-col gap-3 border-[#e6e6e6] border-t px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
					<p className="text-[#8a8a8a] text-xs">
						By continuing you agree to our{" "}
						<Link
							to={ROUTES.terms}
							className="text-[#008080] underline-offset-2 hover:underline"
						>
							Terms
						</Link>{" "}
						and{" "}
						<Link
							to={ROUTES.privacy}
							className="text-[#008080] underline-offset-2 hover:underline"
						>
							Privacy Policy
						</Link>
						.
					</p>
					<div className="flex items-center gap-2 sm:justify-end">
						<DialogPrimitive.Close
							disabled={pending}
							className={cn(
								"h-11 rounded-[12px] border border-[#c7c7c7] bg-white px-5 font-medium text-[#1a1a1a] text-sm",
								"hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-60",
							)}
						>
							Maybe later
						</DialogPrimitive.Close>
						<button
							type="button"
							onClick={handleContinue}
							disabled={pending || isCurrentPlan || isLoadingProducts}
							className={cn(
								"inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#008080] px-6 font-medium text-sm text-white shadow-none",
								"hover:bg-[#006b6b] active:bg-[#005c5c]",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/40",
								"disabled:cursor-not-allowed disabled:opacity-70",
							)}
						>
							{pending ? (
								<>
									<Loader2 className="size-4 animate-spin" aria-hidden />
									{hasActiveSub && !isTrialing ? "Updating…" : "Redirecting…"}
								</>
							) : (
								ctaLabel
							)}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
