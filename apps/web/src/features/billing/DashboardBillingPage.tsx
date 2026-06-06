import { api } from "@legacy-building/backend/convex/_generated/api";
import { PageLoader } from "@legacy-building/ui/components/page-loader";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BillingSubscribePanel } from "@/components/billing/BillingSubscribePanel";
import { BillingActivePage } from "@/features/billing/BillingActivePage";

export function DashboardBillingPage() {
	const subscription = useQuery(api.stripe.queries.getMySubscription);
	const [showWelcome, setShowWelcome] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const checkout = params.get("checkout");
		const subscribe = params.get("subscribe");
		if (checkout === "success") {
			setShowWelcome(true);
		} else if (checkout === "canceled") {
			toast("Checkout canceled — no charge was made.");
		} else if (subscribe === "required") {
			toast.info("Complete payment to unlock journal features.");
		}
		params.delete("checkout");
		params.delete("subscribe");
		const query = params.toString();
		window.history.replaceState(
			{},
			"",
			`${window.location.pathname}${query ? `?${query}` : ""}`,
		);
	}, []);

	if (subscription === undefined) {
		return <PageLoader />;
	}

	const hasActivePlan =
		subscription !== null &&
		(subscription.status === "active" ||
			subscription.status === "trialing" ||
			subscription.status === "past_due");

	if (hasActivePlan) {
		return <BillingActivePage showWelcome={showWelcome} />;
	}

	return (
		<div className="relative flex min-h-svh w-full flex-col bg-[#1a4540]">
			<div className="mt-20 flex flex-1 flex-col gap-10 px-4 py-10 sm:px-6 md:px-10 md:py-12">
				<BillingSubscribePanel />
			</div>
		</div>
	);
}
