"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@legacy-building/ui/components/button";
import { cn } from "@legacy-building/ui/lib/utils";
import { XIcon } from "lucide-react";
import type * as React from "react";

type AppDrawerSide = "left" | "right";

type AppDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	side?: AppDrawerSide;
	title?: string;
	children: React.ReactNode;
	showCloseButton?: boolean;
	className?: string;
	overlayClassName?: string;
};

const sideContentClass: Record<AppDrawerSide, string> = {
	left: "inset-y-0 left-0 w-3/4 border-r data-open:slide-in-from-left-10 data-closed:slide-out-to-left-10",
	right:
		"inset-y-0 right-0 w-3/4 border-l data-open:slide-in-from-right-10 data-closed:slide-out-to-right-10",
};

export function AppDrawer({
	open,
	onOpenChange,
	side = "left",
	title,
	children,
	showCloseButton = true,
	className,
	overlayClassName,
}: AppDrawerProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop
					className={cn(
						"data-open:fade-in-0 data-closed:fade-out-0 fixed inset-0 z-[1505] bg-foreground/60 backdrop-blur-none duration-200",
						"data-closed:pointer-events-none data-closed:invisible data-closed:animate-out",
						"data-open:animate-in data-open:backdrop-blur-sm",
						overlayClassName,
					)}
				/>
				<DialogPrimitive.Popup
					data-side={side}
					className={cn(
						"data-open:fade-in-0 data-closed:fade-out-0 fixed z-[1506] flex h-full max-h-dvh flex-col overflow-hidden bg-popover text-popover-foreground shadow-xl outline-none duration-200 data-closed:animate-out data-open:animate-in",
						sideContentClass[side],
						className,
					)}
				>
					{title ? (
						<DialogPrimitive.Title className="sr-only">
							{title}
						</DialogPrimitive.Title>
					) : null}
					<DialogPrimitive.Description className="sr-only">
						{title ? `${title} panel` : "Side panel"}
					</DialogPrimitive.Description>
					{children}
					{showCloseButton ? (
						<DialogPrimitive.Close
							render={
								<Button
									variant="ghost"
									size="icon-sm"
									className="absolute top-3 right-3 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
								/>
							}
						>
							<XIcon />
							<span className="sr-only">Close</span>
						</DialogPrimitive.Close>
					) : null}
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
