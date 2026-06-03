import { createFileRoute } from "@tanstack/react-router";

import { DashboardAccountPage } from "@/features/account/DashboardAccountPage";

export const Route = createFileRoute("/dashboard/account")({
	component: DashboardAccountPage,
});
