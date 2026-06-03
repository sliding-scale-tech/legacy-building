import { createFileRoute, redirect } from "@tanstack/react-router";

import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/dashboard/")({
	beforeLoad: () => {
		throw redirect({ to: ROUTES.dashboardDesk });
	},
});
