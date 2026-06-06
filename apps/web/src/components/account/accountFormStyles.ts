import { cn } from "@legacy-building/ui/lib/utils";

export const ACCOUNT_PAGE_BG = "#f5f5f5";

export const accountPageClass =
	"mx-auto flex w-full max-w-[1100px] flex-col gap-8";

export const accountSectionTitleClass =
	"font-semibold text-[#1a1a1a] text-xl sm:text-2xl";

export const accountSectionSubtitleClass =
	"text-[#525252] text-sm sm:text-base";

export const accountCardClass =
	"rounded-2xl border border-[#dbeaea] bg-[#ebf6f6] p-5 shadow-sm sm:p-6";

export const accountLabelClass =
	"font-medium text-[#1a1a1a] text-sm leading-[1.4]";

export const accountInputClass = cn(
	"h-11 w-full min-w-0 rounded-xl border border-[#c7c7c7] bg-white px-3 font-normal text-[#1a1a1a] text-sm shadow-none",
	"focus-visible:border-[#008080] focus-visible:ring-0 disabled:cursor-default disabled:bg-[#f5f5f5] disabled:text-[#525252] disabled:opacity-100",
);

export const accountPrimaryButtonClass =
	"inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#008080] px-6 font-medium text-sm text-white shadow-none hover:bg-[#006b6b] disabled:opacity-60";

export const accountSecondaryButtonClass =
	"inline-flex h-10 items-center justify-center rounded-xl border border-[#c7c7c7] bg-white px-5 font-medium text-[#525252] text-sm shadow-sm hover:bg-[#fafafa]";

export const accountDangerZoneHeaderClass =
	"rounded-t-2xl border border-[#fecaca] border-b-0 bg-[#fef2f2] px-5 py-4 sm:px-6";

export const accountDangerZoneBodyClass =
	"rounded-b-2xl border border-[#fecaca] bg-white px-5 py-5 sm:px-6 sm:py-6";

export const accountDangerButtonClass =
	"inline-flex h-11 items-center justify-center rounded-xl bg-[#dc2626] px-6 font-semibold text-sm text-white shadow-none hover:bg-[#b91c1c]";

export const accountWarningBoxClass =
	"rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[#92400e] text-sm leading-relaxed";
