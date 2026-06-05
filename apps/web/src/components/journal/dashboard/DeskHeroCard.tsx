import { assets } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import type { ReactNode } from "react";

type DeskHeroCardProps = {
	children: ReactNode;
	className?: string;
};

/** Desk hero — full-bleed cover like Bubble (no letterboxing on large screens). */
export function DeskHeroCard({ children, className }: DeskHeroCardProps) {
	return (
		<div
			className={cn(
				"relative flex w-full flex-1 overflow-hidden rounded-[20px]",
				/* Full viewport below the fixed dashboard header (mt-20 = 5rem) */
				"min-h-[calc(100svh-5rem)]",
				className,
			)}
		>
			<img
				src={assets.deskHeroBackground}
				alt=""
				aria-hidden
				draggable={false}
				className={cn(
					"pointer-events-none absolute inset-0 size-full select-none object-cover",
					"object-[center_55%] sm:object-[center_52%]",
					/* Anchor top-left so plant + glasses stay in frame on wide screens */
					"lg:object-left-top xl:object-[12%_18%]",
				)}
			/>

			<div
				className={cn(
					"relative z-10 flex min-h-full w-full flex-1",
					"flex-col items-center justify-center gap-4 px-4 py-8",
					"sm:gap-6 sm:px-6 sm:py-10 md:px-10",
				)}
			>
				{children}
			</div>
		</div>
	);
}
