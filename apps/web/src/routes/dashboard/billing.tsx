import { createFileRoute } from "@tanstack/react-router";

import { DashboardBillingPage } from "@/features/billing/DashboardBillingPage";

export const Route = createFileRoute("/dashboard/billing")({
	component: DashboardBillingPage,
});
