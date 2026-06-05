import { cn } from "@legacy-building/ui/lib/utils";
import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import {
	RadioGroup,
	RadioGroupItem,
} from "@/components/journal/ui/radio-group";
import { STORY_TABS, type StoryTab } from "@/lib/journal/journalTypes";

type JournalTypePickerProps = {
	value: StoryTab;
	onChange: (value: StoryTab) => void;
	formId: string;
	/** Reset expanded info when the parent dialog re-opens */
	resetKey?: boolean;
};

export function JournalTypePicker({
	value,
	onChange,
	formId,
	resetKey,
}: JournalTypePickerProps) {
	const [expandedIds, setExpandedIds] = useState<Set<StoryTab>>(
		() => new Set(),
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: collapse info panels when form resets
	useEffect(() => {
		setExpandedIds(new Set());
	}, [resetKey]);

	const toggleInfo = (id: StoryTab, event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		setExpandedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	return (
		<RadioGroup
			value={value}
			onValueChange={(next) => onChange(next as StoryTab)}
			className="flex flex-col gap-3"
		>
			{STORY_TABS.map((option) => {
				const selected = value === option.id;
				const isExpanded = expandedIds.has(option.id);

				return (
					<label
						key={option.id}
						htmlFor={`${formId}-type-${option.id}`}
						className={cn(
							"flex w-full cursor-pointer flex-col rounded-xl border px-3 py-1.5",
							"transition-[background-color,border-color,box-shadow] duration-200 ease-out",
							selected
								? "border-[#008080] bg-[#ebf6f6]"
								: "border-[#c7c7c7] bg-white hover:border-[#008080]/40",
						)}
					>
						<div className="flex min-h-10 items-center justify-between gap-2">
							<span className="text-[#1a1a1a] text-sm leading-[1.4]">
								{option.label}
							</span>
							<div className="flex shrink-0 items-center gap-2">
								<button
									type="button"
									onClick={(event) => toggleInfo(option.id, event)}
									className={cn(
										"flex size-4 items-center justify-center rounded-sm text-[#008080]",
										"transition-transform duration-200 hover:opacity-80 active:scale-95",
										isExpanded && "scale-110",
									)}
									aria-label={`About ${option.label}`}
									aria-expanded={isExpanded}
								>
									<CircleAlert className="size-4" strokeWidth={2} aria-hidden />
								</button>
								<RadioGroupItem
									id={`${formId}-type-${option.id}`}
									value={option.id}
									className="sr-only"
								/>
							</div>
						</div>

						<div
							className={cn(
								"grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
								isExpanded
									? "mt-1 grid-rows-[1fr] opacity-100"
									: "grid-rows-[0fr] opacity-0",
							)}
						>
							<p className="overflow-hidden text-[#6e6e6e] text-xs leading-normal">
								{option.description}
							</p>
						</div>
					</label>
				);
			})}
		</RadioGroup>
	);
}
