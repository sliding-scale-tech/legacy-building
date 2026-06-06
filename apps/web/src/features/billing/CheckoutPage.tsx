import { api } from "@legacy-building/backend/convex/_generated/api";
import { PageLoader } from "@legacy-building/ui/components/page-loader";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAction, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { CheckoutOrderSummary } from "@/components/billing/CheckoutOrderSummary";
import { CheckoutPaymentForm } from "@/components/billing/CheckoutPaymentForm";
import type { BillingPlanChoice } from "@/lib/billing/billingContent";
import {
	type CheckoutFlow,
	planToCheckoutArgs,
} from "@/lib/billing/checkoutSearch";
import { formatAmount } from "@/lib/billing/plans";
import { ROUTES } from "@/lib/routes";

function messageFromError(error: unknown): string {
	if (error instanceof ConvexError) {
		const data = error.data as { message?: string } | string | undefined;
		if (typeof data === "string") return data;
		if (data?.message) return data.message;
	}
	return "Something went wrong. Please try again.";
}

type CheckoutPageProps = {
	plan: BillingPlanChoice;
	flow: CheckoutFlow;
};

export function CheckoutPage({ plan: initialPlan, flow }: CheckoutPageProps) {
	const navigate = useNavigate();
	const publishableKey = useQuery(api.stripe.queries.getStripePublishableKey);
	const products = useQuery(api.stripe.products.queries.listActive);
	const subscription = useQuery(api.stripe.queries.getMySubscription);
	const createEmbeddedCheckout = useAction(
		api.stripe.actions.createEmbeddedSubscriptionCheckout,
	);
	const createEmbeddedUpgradeCheckout = useAction(
		api.stripe.actions.createEmbeddedUpgradeCheckout,
	);
	const finalizeTrialSetup = useAction(
		api.stripe.actions.finalizeEmbeddedTrialSetup,
	);

	const isUpgrade = flow === "upgrade";
	const [plan, setPlan] = useState<BillingPlanChoice>(initialPlan);

	const handlePlanChange = (nextPlan: BillingPlanChoice) => {
		setPlan(nextPlan);
		void navigate({
			to: ROUTES.dashboardBillingCheckout,
			search: { plan: nextPlan, flow },
			replace: true,
		});
	};

	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [intentType, setIntentType] = useState<"setup" | "payment">("setup");
	const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
	const [usesFallbackSetup, setUsesFallbackSetup] = useState(false);
	const [initializing, setInitializing] = useState(true);
	// Upgrade checkout cancels the trial sub server-side; keep the user on checkout
	// even after Convex reports no live subscription.
	const checkoutSessionActiveRef = useRef(isUpgrade);
	const checkoutInitKeyRef = useRef<string | null>(null);
	const checkoutInitKey = `${flow}:${plan}`;

	const monthlyProduct = products?.find((p) => p.interval === "monthly");
	const annualProduct = products?.find((p) => p.interval === "annual");

	const stripePromise = useMemo(
		() => (publishableKey ? loadStripe(publishableKey) : null),
		[publishableKey],
	);

	useEffect(() => {
		if (subscription === undefined || checkoutSessionActiveRef.current) return;
		const hasActive =
			subscription &&
			(subscription.status === "active" ||
				subscription.status === "trialing" ||
				subscription.status === "past_due");
		if (hasActive && !isUpgrade) {
			void navigate({ to: ROUTES.dashboardBilling });
		}
	}, [subscription, navigate, isUpgrade]);

	useEffect(() => {
		if (checkoutInitKeyRef.current === checkoutInitKey) return;
		checkoutInitKeyRef.current = checkoutInitKey;

		let cancelled = false;

		async function initCheckout() {
			checkoutSessionActiveRef.current = true;
			setInitializing(true);
			setClientSecret(null);
			setSubscriptionId(null);
			setUsesFallbackSetup(false);
			try {
				if (isUpgrade) {
					const interval = plan === "annual" ? "annual" : "monthly";
					const result = await createEmbeddedUpgradeCheckout({
						targetInterval: interval,
					});
					if (cancelled) return;
					if (result.completed) {
						window.location.href = `${window.location.origin}${ROUTES.dashboardBillingSuccess}`;
						return;
					}
					if (result.clientSecret && result.intentType) {
						setClientSecret(result.clientSecret);
						setIntentType(result.intentType);
						setSubscriptionId(result.subscriptionId ?? null);
						setUsesFallbackSetup(result.usesFallbackSetup ?? false);
					} else {
						throw new ConvexError({
							code: "CHECKOUT_FAILED",
							message: "Could not start upgrade checkout. Please try again.",
						});
					}
					return;
				}

				const result = await createEmbeddedCheckout(planToCheckoutArgs(plan));
				if (!cancelled) {
					setClientSecret(result.clientSecret);
					setIntentType(result.intentType);
					setSubscriptionId(result.subscriptionId);
					setUsesFallbackSetup(result.usesFallbackSetup);
				}
			} catch (error) {
				if (!cancelled) {
					toast.error(messageFromError(error));
					checkoutSessionActiveRef.current = false;
					checkoutInitKeyRef.current = null;
					void navigate({
						to: isUpgrade
							? ROUTES.dashboardBillingCompare
							: ROUTES.dashboardBilling,
					});
				}
			} finally {
				if (!cancelled) setInitializing(false);
			}
		}

		void initCheckout();
		return () => {
			cancelled = true;
		};
	}, [
		checkoutInitKey,
		createEmbeddedCheckout,
		createEmbeddedUpgradeCheckout,
		isUpgrade,
		navigate,
		plan,
	]);

	const activeProduct = plan === "annual" ? annualProduct : monthlyProduct;
	const payLabel = (() => {
		if (isUpgrade) {
			if (!activeProduct) return "Complete payment";
			return `Pay ${formatAmount(activeProduct.amountCents, activeProduct.currency)}`;
		}
		if (plan === "trial") return "Start my free 7-day trial";
		if (!activeProduct) return "Complete payment";
		return `Pay ${formatAmount(activeProduct.amountCents, activeProduct.currency)}`;
	})();

	if (
		publishableKey === undefined ||
		products === undefined ||
		subscription === undefined
	) {
		return <PageLoader />;
	}

	if (!publishableKey) {
		return (
			<div className="mt-20 flex flex-1 items-center justify-center px-4 py-16">
				<p className="text-center text-[#525252] text-sm">
					Billing is not configured. Set STRIPE_PUBLISHABLE_KEY in Convex.
				</p>
			</div>
		);
	}

	const backHref = isUpgrade
		? ROUTES.dashboardBillingCompare
		: ROUTES.dashboardBilling;
	const backLabel = isUpgrade ? "← Back to compare plans" : "← Back to plans";

	return (
		<div className="relative flex min-h-svh w-full flex-col bg-[#f5f5f5]">
			<div className="mt-20 flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-10">
				<div className="mx-auto flex w-full max-w-[1040px] flex-col gap-8">
					<header className="flex flex-col gap-2">
						<Link
							to={backHref}
							className="w-fit text-[#008080] text-sm hover:underline"
						>
							{backLabel}
						</Link>
						<h1 className="font-semibold text-3xl text-[#1a1a1a]">
							{isUpgrade ? "Upgrade checkout" : "Checkout"}
						</h1>
						<p className="text-[#525252] text-sm">
							{isUpgrade
								? "Confirm your new plan and complete payment."
								: "Securely complete your subscription to Legacy Building."}
						</p>
					</header>

					{initializing || !clientSecret || !stripePromise ? (
						<div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-[#e6e6e6] bg-white">
							<PageLoader overlay={false} />
						</div>
					) : (
						<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
							<CheckoutOrderSummary
								plan={plan}
								onPlanChange={handlePlanChange}
								monthlyProduct={monthlyProduct}
								annualProduct={annualProduct}
								hideTrial={isUpgrade}
							/>

							<div className="rounded-2xl border border-[#e6e6e6] bg-white p-6 shadow-sm sm:p-8">
								<Elements
									key={clientSecret}
									stripe={stripePromise}
									options={{
										clientSecret,
										appearance: {
											theme: "stripe",
											variables: {
												colorPrimary: "#008080",
												borderRadius: "12px",
											},
										},
									}}
								>
									<CheckoutPaymentForm
										intentType={intentType}
										amountLabel={payLabel}
										subscriptionId={subscriptionId}
										usesFallbackSetup={usesFallbackSetup}
										onFinalizeTrialSetup={finalizeTrialSetup}
									/>
								</Elements>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
