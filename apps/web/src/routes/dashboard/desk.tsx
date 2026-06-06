import { PageLoader } from "@legacy-building/ui/components/page-loader";
import { createFileRoute } from "@tanstack/react-router";

import { DashboardDeskPage } from "@/features/journal/DashboardDeskPage";
import { useSkeletonTransition } from "@/hooks/use-skeleton-transition";

export const Route = createFileRoute("/dashboard/desk")({
	component: DeskRoute,
});

function DeskRoute() {
	const showSkeleton = useSkeletonTransition();

	if (showSkeleton) {
		return <PageLoader />;
	}

	return <DashboardDeskPage />;
}
