import { Document } from "@react-pdf/renderer";

import { CoverPage } from "@/components/my-story-pdf/CoverPage";
import { EntryPage } from "@/components/my-story-pdf/EntryPage";
import type { MyStoryDocumentProps } from "@/components/my-story-pdf/types";

export function MyStoryDocument({
	title = "Story",
	journalName,
	entries,
	includeCover = true,
	storyType = "my_story",
}: MyStoryDocumentProps) {
	return (
		<Document>
			{includeCover ? (
				<CoverPage
					title={title}
					journalName={journalName}
					storyType={storyType}
				/>
			) : null}
			{entries.map((entry) => (
				<EntryPage
					key={`${entry.heading}-${entry.date}`}
					journalName={journalName}
					{...entry}
				/>
			))}
		</Document>
	);
}
