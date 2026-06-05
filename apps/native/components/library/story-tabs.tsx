import { Pressable, Text, View } from "react-native";

import { STORY_TABS, type StoryTab } from "@/lib/journal/story-types";

type StoryTabsProps = {
	value: StoryTab;
	onChange: (next: StoryTab) => void;
};

export function StoryTabs({ value, onChange }: StoryTabsProps) {
	return (
		<View className="w-full flex-row gap-3">
			{STORY_TABS.map((tab) => {
				const selected = tab.id === value;
				return (
					<Pressable
						key={tab.id}
						onPress={() => onChange(tab.id)}
						accessibilityRole="button"
						accessibilityState={{ selected }}
						accessibilityLabel={tab.label}
						className={`flex-1 items-center justify-center rounded-2xl px-4 py-3 active:opacity-85 ${
							selected ? "bg-primary" : "bg-primary/40"
						}`}
					>
						<Text className="font-semibold text-base text-primary-foreground">
							{tab.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
