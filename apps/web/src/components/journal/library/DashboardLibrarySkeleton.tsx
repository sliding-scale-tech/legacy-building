import { brand, dashboardLayout } from "@legacy-building/ui/lib/brand-journal";
import { DashboardFooter } from "@/components/journal/dashboard/DashboardFooter";
import { DashboardHeader } from "@/components/journal/dashboard/DashboardHeader";
import { Skeleton } from "@/components/journal/ui/skeleton";

export function DashboardLibrarySkeleton() {
	return (
		<div className="relative flex min-h-svh w-full flex-col bg-white">
			<DashboardHeader />
			<main
				className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5"
				style={{
					marginTop: dashboardLayout.contentMarginTop,
					padding: `${dashboardLayout.contentPaddingY}px ${dashboardLayout.contentPaddingX}px`,
				}}
			>
				<div className="flex justify-between gap-3">
					<Skeleton className="h-11 w-[340px] rounded-xl" />
					<Skeleton className="h-11 w-32 rounded-xl" />
				</div>
				<Skeleton
					className="w-full rounded-[20px]"
					style={{ minHeight: 600, backgroundColor: brand.libraryMint }}
				/>
			</main>
			<DashboardFooter />
		</div>
	);
}
