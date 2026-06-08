"use client";

import type * as React from "react";

import { DialogContent } from "@/components/journal/ui/dialog";
import { dialogOverlayClassName } from "@/components/journal/ui/dialog-overlay-variants";

type DialogContentWithOverlayProps = React.ComponentProps<
	typeof DialogContent
> & {
	overlayBlur?: boolean;
};

export function DialogContentWithOverlay({
	overlayClassName,
	overlayBlur = true,
	...props
}: DialogContentWithOverlayProps) {
	return (
		<DialogContent
			{...props}
			overlayClassName={dialogOverlayClassName({
				blur: overlayBlur,
				className: overlayClassName,
			})}
		/>
	);
}
