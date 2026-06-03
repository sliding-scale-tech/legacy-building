import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";

import { formatDate } from "@/lib/journal/formatDate";
import type { EnrichedJournalEntry } from "@/lib/journal/journalEntryTypes";
export type JournalForPdfExport = {
	title: string;
	dateMs: number;
	dedication?: string;
	coverImageUrl?: string;
};

export type JournalEntryPdfSlice = {
	entry: EnrichedJournalEntry;
	imageSrc?: string;
};

export type JournalExportPdfDocumentProps = {
	journal: JournalForPdfExport;
	includeJournal: boolean;
	coverImageSrc?: string;
	entries: JournalEntryPdfSlice[];
};

const styles = StyleSheet.create({
	page: {
		paddingTop: 42,
		paddingBottom: 42,
		paddingHorizontal: 42,
		fontFamily: "Helvetica",
		fontSize: 11,
		color: "#282828",
	},
	journalSection: {
		marginBottom: 18,
	},
	coverImage: {
		maxWidth: "100%",
		maxHeight: 255,
		marginBottom: 8,
		objectFit: "contain",
	},
	journalTitle: {
		fontSize: 18,
		fontFamily: "Helvetica-Bold",
		color: "#1a1a1a",
		marginBottom: 6,
	},
	metaDate: {
		fontSize: 11,
		color: "#787878",
		marginBottom: 8,
	},
	dedication: {
		fontSize: 11,
		color: "#3c3c3c",
		lineHeight: 1.45,
		marginBottom: 6,
	},
	entryBlock: {
		marginBottom: 18,
	},
	entryTitle: {
		fontSize: 14,
		fontFamily: "Helvetica-Bold",
		color: "#1a1a1a",
		marginBottom: 4,
	},
	entryDate: {
		fontSize: 10,
		color: "#787878",
		marginBottom: 8,
	},
	entryImage: {
		maxWidth: "100%",
		maxHeight: 198,
		marginBottom: 8,
		objectFit: "contain",
	},
	entryBody: {
		fontSize: 11,
		color: "#282828",
		lineHeight: 1.45,
	},
});

export function JournalExportPdfDocument({
	journal,
	includeJournal,
	coverImageSrc,
	entries,
}: JournalExportPdfDocumentProps) {
	return (
		<Document>
			<Page size="A4" style={styles.page} wrap>
				{includeJournal ? (
					<View style={styles.journalSection}>
						{coverImageSrc ? (
							<Image src={coverImageSrc} style={styles.coverImage} />
						) : null}
						<Text style={styles.journalTitle}>{journal.title}</Text>
						<Text style={styles.metaDate}>{formatDate(journal.dateMs)}</Text>
						{journal.dedication?.trim() ? (
							<Text style={styles.dedication}>{journal.dedication.trim()}</Text>
						) : null}
					</View>
				) : null}

				{entries.map(({ entry, imageSrc }) => (
					<View key={entry._id} style={styles.entryBlock}>
						<Text style={styles.entryTitle}>
							{entry.title?.trim() || "Untitled entry"}
						</Text>
						<Text style={styles.entryDate}>{formatDate(entry.dateMs)}</Text>
						{imageSrc ? (
							<Image src={imageSrc} style={styles.entryImage} />
						) : null}
						{entry.body?.trim() ? (
							<Text style={styles.entryBody}>{entry.body.trim()}</Text>
						) : null}
					</View>
				))}
			</Page>
		</Document>
	);
}
