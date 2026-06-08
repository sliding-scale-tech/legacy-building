import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";

export type EntryMode = "writing" | "recording";

const MODES: { id: EntryMode; label: string }[] = [
	{ id: "writing", label: "Writing journal" },
	{ id: "recording", label: "Recording journal" },
];

type EntryModeTabsProps = {
	value: EntryMode;
	onChange: (mode: EntryMode) => void;
};

/** Bubble.io tab strip: 2 columns, 170px min-width, 3px radius on active tab. */
export function EntryModeTabs({ value, onChange }: EntryModeTabsProps) {
	return (
		<div
			className="mx-auto grid w-full grid-cols-2 gap-0"
			role="tablist"
			aria-label="Entry mode"
		>
			{MODES.map((option) => {
				const isActive = value === option.id;
				const isWriting = option.id === "writing";
				return (
					<button
						key={option.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onChange(option.id)}
						className={cn(
							"min-h-10 min-w-0 cursor-pointer px-2.5 py-2.5 font-normal text-sm leading-[1.4] transition-colors sm:text-base",
							isActive
								? isWriting
									? "rounded-[3px] bg-[#008080] text-white"
									: "rounded-[3px] text-white"
								: "bg-white text-[#1a1a1a]",
						)}
						style={
							isActive && !isWriting
								? { backgroundColor: brand.alert }
								: undefined
						}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
