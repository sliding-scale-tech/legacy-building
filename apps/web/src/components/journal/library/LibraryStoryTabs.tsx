import { cn } from "@legacy-building/ui/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/journal/ui/tabs";
import { STORY_TABS, type StoryTab } from "@/lib/journal/journalTypes";

type LibraryStoryTabsProps = {
	value: StoryTab;
	onChange: (tab: StoryTab) => void;
};

const triggerBase =
	"h-auto min-w-0 flex-1 rounded-none border-0 px-2.5 py-2.5 text-sm font-normal leading-[1.4] shadow-none transition-colors after:hidden focus-visible:ring-0 sm:text-base";

const triggerInactive =
	"bg-[#ebf6f6] text-[#1a1a1a] data-[state=inactive]:bg-[#ebf6f6] data-[state=inactive]:text-[#1a1a1a]";

const triggerActive =
	"data-[state=active]:!bg-[#008080] data-[state=active]:!text-white";

export function LibraryStoryTabs({ value, onChange }: LibraryStoryTabsProps) {
	return (
		<Tabs
			value={value}
			onValueChange={(next) => onChange(next as StoryTab)}
			aria-label="Story type"
		>
			<TabsList
				variant="line"
				className="h-auto w-full gap-0 rounded-xl bg-transparent p-0"
			>
				{STORY_TABS.map((tab, index) => {
					const isFirst = index === 0;
					const isLast = index === STORY_TABS.length - 1;
					return (
						<TabsTrigger
							key={tab.id}
							value={tab.id}
							className={cn(
								triggerBase,
								triggerInactive,
								triggerActive,
								isFirst && "rounded-l-xl",
								isLast && "rounded-r-xl",
							)}
						>
							{tab.label}
						</TabsTrigger>
					);
				})}
			</TabsList>
		</Tabs>
	);
}
