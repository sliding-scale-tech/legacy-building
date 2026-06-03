import { createFileRoute } from "@tanstack/react-router";

import { DashboardLibrarySkeleton } from "@/components/journal/library/DashboardLibrarySkeleton";
import { DashboardLibraryPage } from "@/features/journal/DashboardLibraryPage";
import { useSkeletonTransition } from "@/hooks/use-skeleton-transition";

export const Route = createFileRoute("/dashboard/library")({
	component: LibraryRoute,
});

function LibraryRoute() {
	const showSkeleton = useSkeletonTransition();

	if (showSkeleton) {
		return <DashboardLibrarySkeleton />;
	}

	return <DashboardLibraryPage />;
}
