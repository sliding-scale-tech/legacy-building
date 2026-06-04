import { cn } from "@legacy-building/ui/lib/utils";
import type { ReactNode } from "react";

type PaginatedTableFrameProps = {
	pageIndex: number;
	isTransitioning?: boolean;
	children: ReactNode;
	className?: string;
};

/** Fade/slide when the visible page changes or while the next page loads. */
export function PaginatedTableFrame({
	pageIndex,
	isTransitioning = false,
	children,
	className,
}: PaginatedTableFrameProps) {
	return (
		<div
			className={cn(
				"relative transition-[opacity,transform] duration-300 ease-out",
				isTransitioning && "pointer-events-none scale-[0.99] opacity-50",
				className,
			)}
		>
			<div
				key={pageIndex}
				className="fade-in-50 slide-in-from-bottom-1 animate-in duration-300"
			>
				{children}
			</div>
		</div>
	);
}
