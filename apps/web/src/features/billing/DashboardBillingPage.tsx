import { api } from "@legacy-building/backend/convex/_generated/api";
import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { useAction, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { ExternalLink, Loader2, Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { usePricing } from "@/components/billing/PricingProvider";
import { DashboardFooter } from "@/components/journal/dashboard/DashboardFooter";
import {
	formatAmount,
	intervalLabel,
	intervalSuffix,
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

function formatDate(seconds: number) {
	return new Date(seconds * 1000).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function formatMoney(amountInCents: number) {
	return `$${(amountInCents / 100).toFixed(2)}`;
}

type Subscription = NonNullable<
	FunctionReturnType<typeof api.stripe.queries.getMySubscription>
>;

function describeSubscription(subscription: Subscription) {
	const priceLabel =
		subscription.plan && subscription.interval
			? `${formatAmount(subscription.plan.amountCents, subscription.plan.currency)} ${intervalSuffix(subscription.interval)}`
			: "—";
	const name =
		subscription.plan?.name ??
		(subscription.interval
			? intervalLabel(subscription.interval)
			: "Subscription");
	const periodEnd = subscription.currentPeriodEnd
		? formatDate(subscription.currentPeriodEnd)
		: null;

	if (subscription.status === "trialing") {
		return {
			name,
			priceLabel,
			stateLabel: "Free trial",
			detail: periodEnd
				? `Trial ends ${periodEnd}${subscription.cancelAtPeriodEnd ? " — won't renew" : ", then billing begins"}`
				: "7-day free trial",
			tone: "active" as const,
		};
	}
	if (subscription.status === "active") {
		return {
			name,
			priceLabel,
			stateLabel: subscription.cancelAtPeriodEnd ? "Canceling" : "Active",
			detail: periodEnd
				? subscription.cancelAtPeriodEnd
					? `Access ends ${periodEnd}`
					: `Renews ${periodEnd}`
				: "Active subscription",
			tone: subscription.cancelAtPeriodEnd
				? ("warning" as const)
				: ("active" as const),
		};
	}
	if (subscription.status === "past_due" || subscription.status === "unpaid") {
		return {
			name,
			priceLabel,
			stateLabel: "Payment past due",
			detail: "Update your payment method to keep your subscription.",
			tone: "warning" as const,
		};
	}
	return {
		name,
		priceLabel,
		stateLabel: "Canceled",
		detail: periodEnd ? `Ended ${periodEnd}` : "No longer active",
		tone: "muted" as const,
	};
}

function invoiceBadge(status: string) {
	switch (status) {
		case "paid":
			return { label: "Paid", bg: "#ebf6f6", color: brand.primary };
		case "open":
			return { label: "Due", bg: "#fff4db", color: brand.alert };
		case "uncollectible":
		case "void":
			return { label: "Void", bg: "#f2f2f2", color: "#525252" };
		case "draft":
			return { label: "Draft", bg: "#f2f2f2", color: "#525252" };
		default:
			return {
				label: status.charAt(0).toUpperCase() + status.slice(1),
				bg: "#f2f2f2",
				color: "#525252",
			};
	}
}

export function DashboardBillingPage() {
	const { openPricing } = usePricing();
	const subscription = useQuery(api.stripe.queries.getMySubscription);
	const invoices = useQuery(api.stripe.queries.listMyInvoices);

	const createBillingPortalSession = useAction(
		api.stripe.actions.createBillingPortalSession,
	);
	const cancelSubscription = useAction(api.stripe.actions.cancelSubscription);
	const reactivateSubscription = useAction(
		api.stripe.actions.reactivateSubscription,
	);

	const [portalPending, setPortalPending] = useState(false);
	const [mutationPending, setMutationPending] = useState(false);
	const [confirmingCancel, setConfirmingCancel] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const checkout = params.get("checkout");
		if (!checkout) return;
		if (checkout === "success") {
			toast.success(
				"Subscription started! It may take a few seconds to appear here.",
			);
		} else if (checkout === "canceled") {
			toast("Checkout canceled — no charge was made.");
		}
		params.delete("checkout");
		const query = params.toString();
		window.history.replaceState(
			{},
			"",
			`${window.location.pathname}${query ? `?${query}` : ""}`,
		);
	}, []);

	const isLoading = subscription === undefined;
	const hasActivePlan =
		subscription !== null &&
		subscription !== undefined &&
		(subscription.status === "active" ||
			subscription.status === "trialing" ||
			subscription.status === "past_due");
	const canCancel = hasActivePlan && !subscription?.cancelAtPeriodEnd;
	const canReactivate = hasActivePlan && subscription?.cancelAtPeriodEnd;

	const summary = useMemo(
		() => (subscription ? describeSubscription(subscription) : null),
		[subscription],
	);
	const pendingPlanChange = subscription?.pendingPlanChange ?? null;

	const openPortal = async () => {
		if (portalPending) return;
		setPortalPending(true);
		try {
			const { url } = await createBillingPortalSession({
				returnUrl: `${window.location.origin}${ROUTES.dashboardBilling}`,
			});
			window.location.href = url;
		} catch (error) {
			toast.error(messageFromError(error));
			setPortalPending(false);
		}
	};

	const handleCancel = async () => {
		if (mutationPending) return;
		setMutationPending(true);
		try {
			await cancelSubscription({ atPeriodEnd: true });
			toast.success("Your subscription will end at the period close.");
			setConfirmingCancel(false);
		} catch (error) {
			toast.error(messageFromError(error));
		} finally {
			setMutationPending(false);
		}
	};

	const handleReactivate = async () => {
		if (mutationPending) return;
		setMutationPending(true);
		try {
			await reactivateSubscription({});
			toast.success("Your subscription will continue to renew.");
		} catch (error) {
			toast.error(messageFromError(error));
		} finally {
			setMutationPending(false);
		}
	};

	if (isLoading) {
		return (
			<div className="relative flex min-h-svh w-full flex-col bg-white">
				<div className="mt-20 flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-10">
					<div className="mx-auto w-full max-w-[920px] animate-pulse">
						<div className="h-[200px] rounded-[20px] bg-[#f0f7f7]" />
						<div className="mt-6 h-[280px] rounded-[20px] bg-[#f0f7f7]" />
					</div>
				</div>
				<DashboardFooter />
			</div>
		);
	}

	const stateBg =
		summary?.tone === "active"
			? "#dff0f0"
			: summary?.tone === "warning"
				? "#fff4db"
				: "#f2f2f2";
	const stateColor =
		summary?.tone === "active"
			? brand.primary
			: summary?.tone === "warning"
				? brand.alert
				: "#525252";

	return (
		<div className="relative flex min-h-svh w-full flex-col bg-white">
			<div className="mt-20 flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-10">
				<div className="mx-auto flex w-full max-w-[920px] flex-col gap-6">
					<header className="flex flex-col gap-1">
						<h1 className="font-semibold text-2xl text-[#1a1a1a] leading-tight">
							Billing
						</h1>
						<p className="text-[#525252] text-sm">
							Manage your subscription and review past invoices.
						</p>
					</header>

					<section
						className="rounded-[20px] px-6 py-6 sm:px-8 sm:py-7"
						style={{ backgroundColor: brand.libraryMint }}
					>
						<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
							<div className="flex flex-col gap-2">
								<span className="font-medium text-[#525252] text-xs uppercase tracking-wide">
									Current plan
								</span>
								<div className="flex items-baseline gap-3">
									<h2 className="font-semibold text-2xl text-[#1a1a1a] leading-none">
										{summary?.name ?? "Free"}
									</h2>
									<span className="text-[#525252] text-sm">
										{summary?.priceLabel ?? "—"}
									</span>
								</div>
								<div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
									<span
										className="inline-flex items-center rounded-full px-2.5 py-1 font-medium text-xs"
										style={{ backgroundColor: stateBg, color: stateColor }}
									>
										{summary?.stateLabel ?? "No active subscription"}
									</span>
									<span className="text-[#8a8a8a]">
										{summary?.detail ?? "Choose a plan to unlock full access."}
									</span>
								</div>
								{pendingPlanChange ? (
									<p className="mt-1 text-[#525252] text-xs">
										Switches to {intervalLabel(pendingPlanChange.interval)} on{" "}
										{formatDate(pendingPlanChange.effectiveAt)}.
									</p>
								) : null}
							</div>

							<div className="flex flex-col gap-2 sm:items-end">
								<button
									type="button"
									onClick={openPricing}
									className="h-11 rounded-[12px] bg-[#008080] px-5 font-medium text-sm text-white transition-colors hover:bg-[#006b6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/40"
								>
									{hasActivePlan ? "Change plan" : "Choose a plan"}
								</button>

								{hasActivePlan ? (
									<button
										type="button"
										onClick={openPortal}
										disabled={portalPending}
										className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-[#c7c7c7] bg-white px-4 font-medium text-[#1a1a1a] text-sm transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-60"
									>
										{portalPending ? (
											<Loader2 className="size-4 animate-spin" aria-hidden />
										) : (
											<ExternalLink className="size-3.5" aria-hidden />
										)}
										Manage billing
									</button>
								) : null}

								{canReactivate ? (
									<button
										type="button"
										onClick={handleReactivate}
										disabled={mutationPending}
										className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-[#008080] bg-white px-4 font-medium text-[#008080] text-sm transition-colors hover:bg-[#f0f7f7] disabled:cursor-not-allowed disabled:opacity-60"
									>
										{mutationPending ? (
											<Loader2 className="size-4 animate-spin" aria-hidden />
										) : null}
										Resume subscription
									</button>
								) : null}

								{canCancel ? (
									confirmingCancel ? (
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={handleCancel}
												disabled={mutationPending}
												className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-[#c2410c] px-4 font-medium text-sm text-white transition-colors hover:bg-[#9a3412] disabled:cursor-not-allowed disabled:opacity-60"
											>
												{mutationPending ? (
													<Loader2
														className="size-4 animate-spin"
														aria-hidden
													/>
												) : null}
												Confirm cancel
											</button>
											<button
												type="button"
												onClick={() => setConfirmingCancel(false)}
												disabled={mutationPending}
												className="h-9 rounded-[10px] border border-[#c7c7c7] bg-white px-4 font-medium text-[#1a1a1a] text-sm transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-60"
											>
												Keep plan
											</button>
										</div>
									) : (
										<button
											type="button"
											onClick={() => setConfirmingCancel(true)}
											className="h-9 rounded-[10px] border border-[#c7c7c7] bg-white px-4 font-medium text-[#1a1a1a] text-sm transition-colors hover:bg-[#f7f7f7]"
										>
											Cancel subscription
										</button>
									)
								) : null}
							</div>
						</div>
					</section>

					<section className="rounded-[20px] border border-[#e6e6e6] bg-white">
						<div className="flex items-center justify-between px-6 py-5 sm:px-8">
							<h3 className="font-semibold text-[#1a1a1a] text-lg leading-none">
								Invoice history
							</h3>
							<span className="text-[#8a8a8a] text-xs">
								{invoices === undefined
									? "Loading…"
									: `${invoices.length} ${invoices.length === 1 ? "invoice" : "invoices"}`}
							</span>
						</div>

						<div className="border-[#e6e6e6] border-t">
							{invoices === undefined ? (
								<div className="flex flex-col gap-3 px-6 py-6 sm:px-8">
									<div className="h-10 animate-pulse rounded-lg bg-[#f0f7f7]" />
									<div className="h-10 animate-pulse rounded-lg bg-[#f0f7f7]" />
								</div>
							) : invoices.length === 0 ? (
								<div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
									<Receipt className="size-8 text-[#c7c7c7]" aria-hidden />
									<p className="font-medium text-[#1a1a1a] text-sm">
										No invoices yet
									</p>
									<p className="text-[#8a8a8a] text-xs">
										Past invoices will appear here once your subscription is
										active.
									</p>
								</div>
							) : (
								<ul className="divide-y divide-[#e6e6e6]">
									{invoices.map((invoice) => {
										const badge = invoiceBadge(invoice.status);
										const amount =
											invoice.status === "paid"
												? invoice.amountPaid
												: invoice.amountDue;
										return (
											<li
												key={invoice.stripeInvoiceId}
												className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"
											>
												<div className="flex flex-col gap-0.5">
													<span className="font-medium text-[#1a1a1a] text-sm">
														{formatMoney(amount)}
													</span>
													<span className="text-[#8a8a8a] text-xs">
														{formatDate(invoice.created)}
													</span>
												</div>
												<div className="flex items-center gap-3">
													<span
														className="inline-flex items-center rounded-full px-2.5 py-1 font-medium text-xs"
														style={{
															backgroundColor: badge.bg,
															color: badge.color,
														}}
													>
														{badge.label}
													</span>
													<button
														type="button"
														onClick={openPortal}
														disabled={portalPending}
														className={cn(
															"inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#c7c7c7] bg-white px-3 font-medium text-[#1a1a1a] text-xs",
															"transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-60",
														)}
														aria-label="Open billing portal to view invoice"
													>
														<ExternalLink className="size-3.5" aria-hidden />
														View
													</button>
												</div>
											</li>
										);
									})}
								</ul>
							)}
						</div>
					</section>

					<p className="text-[#8a8a8a] text-xs">
						Invoices, receipts, and payment methods are managed securely through
						the Stripe billing portal. Need help? Contact support and we'll sort
						it out.
					</p>
				</div>
			</div>
			<DashboardFooter />
		</div>
	);
}
