import type { Doc } from "../_generated/dataModel";

/** Lower values appear first in the library grid. */
export function journalLibrarySortKey(journal: Doc<"journals">): number {
	return journal.sortOrder ?? journal._creationTime;
}

export function compareJournalsForLibrary(
	a: Doc<"journals">,
	b: Doc<"journals">,
): number {
	return journalLibrarySortKey(a) - journalLibrarySortKey(b);
}
