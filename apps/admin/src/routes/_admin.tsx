import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminHeader } from "@/components/admin-header";
import { AdminRouteGate } from "@/components/admin-route-gate";

export const Route = createFileRoute("/_admin")({
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<AdminRouteGate>
			<div className="grid min-h-svh grid-rows-[auto_1fr]">
				<AdminHeader />
				<main className="overflow-y-auto">
					<Outlet />
				</main>
			</div>
		</AdminRouteGate>
	);
}
