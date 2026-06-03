import { assets, dashboardLayout } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Skeleton } from "@/components/journal/ui/skeleton";

export function DashboardDeskSkeleton() {
	return (
		<div className="relative flex min-h-svh w-full flex-col bg-white">
			<header
				className={cn(
					"fixed inset-x-0 top-0 z-[1504] flex min-h-[80px] items-center justify-center",
					"bg-center bg-cover bg-no-repeat shadow-[0_2px_2px_0_#f7f7f7]",
				)}
				style={{
					backgroundImage: `url("${assets.headerBackground}")`,
					paddingLeft: dashboardLayout.headerPaddingLeft,
					paddingRight: dashboardLayout.headerPaddingRight,
				}}
			>
				<div className="flex w-full max-w-[1200px] items-center justify-between">
					<Skeleton className="h-[50px] w-[200px] rounded-md bg-white/20" />
					<div className="flex gap-6">
						<Skeleton className="h-5 w-12 rounded-md bg-white/25" />
						<Skeleton className="h-5 w-16 rounded-md bg-white/20" />
						<Skeleton className="h-5 w-16 rounded-md bg-white/20" />
					</div>
					<Skeleton className="size-[50px] rounded-full bg-white/30" />
				</div>
			</header>

			<div className="mt-20 flex flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5 md:px-10">
				<div className="relative flex min-h-[clamp(380px,55svh,500px)] w-full flex-col items-center justify-center rounded-[20px] bg-[#e8e4de] px-4 py-8 sm:px-6 sm:py-10">
					<div className="mb-6 w-full max-w-[300px] self-center lg:absolute lg:top-[18%] lg:left-6 lg:mb-0">
						<Skeleton className="mb-2 h-5 w-32 rounded-md bg-[#e6e6e6]" />
						<Skeleton className="h-[268px] w-full rounded-xl bg-[#e6e6e6]" />
					</div>
					<Skeleton className="size-[clamp(7.5rem,32vw,12.5rem)] rounded-full bg-[#e6e6e6]" />
					<Skeleton className="mt-4 h-8 w-36 max-w-[60%] rounded-md bg-[#e6e6e6]" />
				</div>
			</div>

			<footer className="flex justify-center gap-5 bg-[#f2f2f2] px-4 py-5">
				<Skeleton className="h-5 w-32 rounded-md bg-[#e6e6e6]" />
				<Skeleton className="h-5 w-px bg-[#e6e6e6]" />
				<Skeleton className="h-5 w-28 rounded-md bg-[#e6e6e6]" />
			</footer>
		</div>
	);
}
