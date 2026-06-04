import { brand } from "@legacy-building/ui/lib/brand-journal";

/** Shared Legacy Building admin surface tokens */
export const adminTheme = {
	pageBg: brand.libraryMint,
	primaryClass: "bg-[#008080] text-white hover:bg-[#006b6b]",
	primaryTextClass: "text-[#008080] dark:text-primary",
} as const;

/** Mint in light mode; semantic background in dark */
export const adminPageClass =
	"min-h-full bg-[#ebf6f6] text-foreground dark:bg-background";
export const adminContainerClass =
	"mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8";

/** Theme-aware surfaces (uses CSS variables — works in light + dark) */
export const adminCardClass =
	"rounded-2xl border border-border bg-card text-card-foreground shadow-[0_4px_16px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]";

export const adminStatCardClass = `${adminCardClass} transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_6px_28px_rgba(0,0,0,0.45)]`;

export const adminTableHeadRowClass =
	"border-border border-b bg-muted/70 dark:bg-muted/40";
export const adminTableHeadCellClass =
	"px-4 py-3 font-medium text-muted-foreground text-sm";
export const adminTableRowClass =
	"cursor-pointer border-border border-b transition-colors last:border-0 hover:bg-muted/50 dark:hover:bg-muted/25";
export const adminTableCellPrimaryClass =
	"px-4 py-3 font-medium text-foreground";
export const adminTableCellMutedClass = "px-4 py-3 text-muted-foreground";

export const adminPrimaryButtonClass = `${adminTheme.primaryClass} h-11 rounded-xl font-medium transition-opacity hover:opacity-95 disabled:opacity-50`;

export const adminPrimaryButtonSmClass = `${adminTheme.primaryClass} h-9 min-h-9 rounded-xl border-0 px-4 font-medium text-sm shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50`;

export const adminDestructiveButtonClass =
	"h-9 min-h-9 rounded-xl border-0 bg-[#b0200c] px-4 font-medium text-sm text-white shadow-sm transition-colors hover:bg-[#9a1c0a] hover:text-white active:scale-[0.98] disabled:opacity-50";

/** Solid destructive confirm (dialog footer) */
export const adminDestructiveConfirmButtonClass =
	"h-11 rounded-xl border-0 bg-[#b0200c] px-4 font-medium text-white shadow-sm transition-colors hover:bg-[#9a1c0a] hover:text-white active:scale-[0.98] disabled:opacity-50";
