export type StoryTab = "my_story" | "their_story";

export const STORY_TABS: { id: StoryTab; label: string }[] = [
	{ id: "my_story", label: "My Story" },
	{ id: "their_story", label: "Their Story" },
];

export const DEFAULT_STORY_TAB: StoryTab = "my_story";

export function isStoryTab(value: unknown): value is StoryTab {
	return value === "my_story" || value === "their_story";
}
