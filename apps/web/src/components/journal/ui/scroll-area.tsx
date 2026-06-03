import { cn } from "@legacy-building/ui/lib/utils";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import type * as React from "react";

type ScrollAreaProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
	scrollbarClassName?: string;
	thumbClassName?: string;
	viewportClassName?: string;
};

function ScrollArea({
	className,
	children,
	scrollbarClassName,
	thumbClassName,
	viewportClassName,
	...props
}: ScrollAreaProps) {
	return (
		<ScrollAreaPrimitive.Root
			data-slot="scroll-area"
			className={cn("relative", className)}
			{...props}
		>
			<ScrollAreaPrimitive.Viewport
				data-slot="scroll-area-viewport"
				className={cn(
					"size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50",
					viewportClassName,
				)}
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			<ScrollBar
				className={scrollbarClassName}
				thumbClassName={thumbClassName}
			/>
			<ScrollAreaPrimitive.Corner />
		</ScrollAreaPrimitive.Root>
	);
}

type ScrollBarProps = React.ComponentProps<
	typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> & {
	thumbClassName?: string;
};

function ScrollBar({
	className,
	thumbClassName,
	orientation = "vertical",
	...props
}: ScrollBarProps) {
	return (
		<ScrollAreaPrimitive.ScrollAreaScrollbar
			data-slot="scroll-area-scrollbar"
			data-orientation={orientation}
			orientation={orientation}
			className={cn(
				"flex touch-none select-none p-px transition-colors data-horizontal:h-2.5 data-vertical:h-full data-vertical:w-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:border-l data-vertical:border-l-transparent",
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitive.ScrollAreaThumb
				data-slot="scroll-area-thumb"
				className={cn("relative flex-1 rounded-full bg-border", thumbClassName)}
			/>
		</ScrollAreaPrimitive.ScrollAreaScrollbar>
	);
}

export { ScrollArea, ScrollBar };
