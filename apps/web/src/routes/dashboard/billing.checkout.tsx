import { createFileRoute } from "@tanstack/react-router";

import { CheckoutPage } from "@/features/billing/CheckoutPage";
import { checkoutSearchSchema } from "@/lib/billing/checkoutSearch";

export const Route = createFileRoute("/dashboard/billing/checkout")({
	validateSearch: checkoutSearchSchema,
	component: CheckoutRoute,
});

function CheckoutRoute() {
	const { plan, flow } = Route.useSearch();
	return <CheckoutPage plan={plan} flow={flow} />;
}
