import { cn } from "@legacy-building/ui/lib/utils";
import { cva } from "class-variance-authority";

export const dialogOverlayVariants = cva("", {
	variants: {
		blur: {
			true: "supports-backdrop-filter:backdrop-blur-xs",
			false: "",
		},
	},
	defaultVariants: {
		blur: true,
	},
});

export function dialogOverlayClassName({
	blur = true,
	className,
}: {
	blur?: boolean;
	className?: string;
} = {}) {
	return cn(dialogOverlayVariants({ blur }), className);
}
