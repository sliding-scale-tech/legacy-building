import { cn } from "@legacy-building/ui/lib/utils";

export const accountCardClass =
	"mx-auto w-full max-w-[560px] rounded-[20px] bg-[#f0f7f7] px-6 py-8 sm:px-10 sm:py-10";

export const accountLabelClass =
	"font-normal text-[#1a1a1a] text-sm leading-[1.4]";

export const accountInputClass = cn(
	"h-11 w-full min-w-0 rounded-[12px] border border-[#c7c7c7] bg-white px-3 font-normal text-[#1a1a1a] text-sm shadow-none",
	"focus-visible:border-[#008080] focus-visible:ring-0 disabled:cursor-default disabled:opacity-100",
);

export const accountPrimaryButtonClass =
	"h-11 shrink-0 rounded-[12px] bg-[#008080] px-6 font-medium text-sm text-white shadow-none hover:bg-[#006b6b]";

export const accountDangerButtonClass =
	"h-11 w-full rounded-[12px] border border-[#b0200c] bg-[#ebf6f6] px-6 font-medium text-[#b0200c] text-sm shadow-none hover:bg-[#fae8e6]";
