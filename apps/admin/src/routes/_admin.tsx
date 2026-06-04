import { dashboardLayout } from "@legacy-building/ui/lib/brand-journal";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminHeader } from "@/components/admin-header";
import { AdminRouteGate } from "@/components/admin-route-gate";
import { adminPageClass } from "@/lib/admin-theme";

export const Route = createFileRoute("/_admin")({
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<AdminRouteGate>
			<div className="min-h-svh">
				<AdminHeader />
				<main
					className={`overflow-y-auto ${adminPageClass}`}
					style={{ paddingTop: dashboardLayout.contentMarginTop }}
				>
					<Outlet />
				</main>
			</div>
		</AdminRouteGate>
	);
}
