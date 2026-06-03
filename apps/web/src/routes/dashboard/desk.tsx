import { createFileRoute } from "@tanstack/react-router";

import { DashboardDeskSkeleton } from "@/components/journal/dashboard/DashboardDeskSkeleton";
import { DashboardDeskPage } from "@/features/journal/DashboardDeskPage";
import { useSkeletonTransition } from "@/hooks/use-skeleton-transition";

export const Route = createFileRoute("/dashboard/desk")({
	component: DeskRoute,
});

function DeskRoute() {
	const showSkeleton = useSkeletonTransition();

	if (showSkeleton) {
		return <DashboardDeskSkeleton />;
	}

	return <DashboardDeskPage />;
}
