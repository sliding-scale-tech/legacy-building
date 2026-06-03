import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";

import type { StoryTab } from "@/lib/journal/journalTypes";

declare module "@tanstack/react-router" {
	interface HistoryState {
		journalId?: Id<"journals">;
		storyTab?: StoryTab;
		openAddEntry?: boolean;
		skeleton?: boolean;
	}
}
