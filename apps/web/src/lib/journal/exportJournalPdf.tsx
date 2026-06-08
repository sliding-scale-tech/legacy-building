import { pdf } from "@react-pdf/renderer";

import { MyStoryDocument } from "@/components/my-story-pdf/MyStoryDocument";
import type { MyStoryEntry } from "@/components/my-story-pdf/types";
import { formatPdfLongDate } from "@/lib/journal/formatDate";
import type { EnrichedJournalEntry } from "@/lib/journal/journalEntryTypes";
import type { JournalStoryType } from "@/lib/journal/journalTypes";

export type JournalForPdfExport = {
	title: string;
	dateMs: number;
	type: JournalStoryType;
	dedication?: string;
	coverImageUrl?: string;
};

async function fetchImageDataUrl(url: string): Promise<string | null> {
	try {
		const response = await fetch(url);
		if (!response.ok) return null;
		const blob = await response.blob();
		return await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}

function downloadPdfBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	setTimeout(() => {
		URL.revokeObjectURL(url);
		anchor.remove();
	}, 1000);
}

async function mapEntriesToMyStory(
	entries: EnrichedJournalEntry[],
): Promise<MyStoryEntry[]> {
	const writingEntries = entries.filter((entry) => entry.mode === "writing");
	return Promise.all(
		writingEntries.map(async (entry) => ({
			heading: entry.title?.trim() || "Untitled entry",
			date: formatPdfLongDate(entry.dateMs),
			body: entry.body?.trim() ?? "",
			imageBase64: entry.imageUrl
				? ((await fetchImageDataUrl(entry.imageUrl)) ?? undefined)
				: undefined,
		})),
	);
}

export async function exportJournalEntriesToPdf({
	journal,
	includeJournal,
	entries,
}: {
	journal: JournalForPdfExport;
	includeJournal: boolean;
	entries: EnrichedJournalEntry[];
}): Promise<void> {
	const myStoryEntries = await mapEntriesToMyStory(entries);
	const journalName = journal.title?.trim() || "Journal";

	const blob = await pdf(
		<MyStoryDocument
			title="Story"
			journalName={journalName}
			entries={myStoryEntries}
			includeCover={includeJournal}
			storyType={journal.type}
		/>,
	).toBlob();

	const safeName = journalName.replace(/[^\w\s-]/g, "").trim() || "journal";
	downloadPdfBlob(blob, `${safeName}_entries.pdf`);
}
