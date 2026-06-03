import { pdf } from "@react-pdf/renderer";
import {
	type JournalEntryPdfSlice,
	JournalExportPdfDocument,
	type JournalForPdfExport,
} from "@/lib/journal/journal-export-pdf-document";
import type { EnrichedJournalEntry } from "@/lib/journal/journalEntryTypes";

export type { JournalForPdfExport };

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
	URL.revokeObjectURL(url);
}

async function prepareEntrySlices(
	entries: EnrichedJournalEntry[],
): Promise<JournalEntryPdfSlice[]> {
	const writingEntries = entries.filter((entry) => entry.mode === "writing");
	return Promise.all(
		writingEntries.map(async (entry) => ({
			entry,
			imageSrc: entry.imageUrl
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
	const coverImageSrc =
		includeJournal && journal.coverImageUrl
			? ((await fetchImageDataUrl(journal.coverImageUrl)) ?? undefined)
			: undefined;

	const entrySlices = await prepareEntrySlices(entries);

	const blob = await pdf(
		<JournalExportPdfDocument
			journal={journal}
			includeJournal={includeJournal}
			coverImageSrc={coverImageSrc}
			entries={entrySlices}
		/>,
	).toBlob();

	const safeName = journal.title.replace(/[^\w\s-]/g, "").trim() || "journal";
	downloadPdfBlob(blob, `${safeName}_entries.pdf`);
}
