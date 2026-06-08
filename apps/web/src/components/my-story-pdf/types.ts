import type { JournalStoryType } from "@/lib/journal/journalTypes";

export type MyStoryEntry = {
	heading: string;
	date: string;
	body: string;
	imageBase64?: string;
};

export type MyStoryDocumentProps = {
	title?: string;
	journalName: string;
	entries: MyStoryEntry[];
	includeCover?: boolean;
	storyType?: JournalStoryType;
};
