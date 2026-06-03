import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";

/** Bubble add-entry form shell (max-width 1200px, 40px radius, 24px gaps). */
export const bubbleFormShell =
	"mx-auto flex w-full max-w-[1200px] flex-col gap-6 rounded-[40px] px-5 pt-5 pb-[60px]";

export const bubbleFieldStack = "flex flex-col gap-1";

export const bubbleLabelClass =
	"font-normal text-[#1a1a1a] text-sm leading-[1.4]";

export const bubbleRowGap24 = "gap-6";

export function bubbleInputClass(invalid: boolean) {
	return cn(
		"h-11 max-h-11 w-full min-w-0 rounded-[12px] border bg-white px-3 font-normal text-[#1a1a1a] text-sm shadow-none focus-visible:ring-0",
		invalid
			? "border-[#b0200c] focus-visible:border-[#b0200c]"
			: "border-[#c7c7c7] focus-visible:border-[#c7c7c7]",
	);
}

export function bubbleTextareaClass(invalid: boolean) {
	return cn(
		"max-h-[400px] min-h-[120px] w-full resize-none rounded-[12px] border bg-white p-3 font-normal text-[#1a1a1a] text-sm leading-[1.4] shadow-none focus-visible:ring-0",
		invalid
			? "border-[#b0200c] focus-visible:border-[#b0200c]"
			: "border-[#c7c7c7] focus-visible:border-[#c7c7c7]",
	);
}

export function bubbleSelectTriggerClass(invalid: boolean) {
	return cn(
		"h-11 w-full min-w-0 rounded-[12px] border bg-white px-3 font-normal text-[#1a1a1a] text-sm shadow-none disabled:opacity-100",
		invalid ? "border-[#b0200c]" : "border-[#c7c7c7]",
	);
}

export function accentForMode(mode: "writing" | "recording") {
	return mode === "writing" ? brand.primary : brand.alert;
}

/** Centered content width matching Bubble floating group. */
export const entryFormMaxWidthClass = "mx-auto w-full max-w-[1200px]";

/** Aliases for sidebar edit forms. */
export const fieldLabelClass = bubbleLabelClass;
export const fieldInputClass = bubbleInputClass;
export const fieldTextareaClass = bubbleTextareaClass;
export const fieldEntryLogClass = bubbleTextareaClass;
