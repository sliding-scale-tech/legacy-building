import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = Pick<QueryCtx, "auth"> | Pick<MutationCtx, "auth">;

export async function requireClerkUserId(ctx: AuthCtx): Promise<string> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError({
			code: "UNAUTHENTICATED",
			message: "You must be signed in.",
		});
	}
	return identity.subject;
}

export function assertJournalOwner(
	journal: Doc<"journals">,
	userId: string,
): void {
	if (journal.userId !== userId) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "You do not have access to this journal.",
		});
	}
}

export function assertEntryOwner(
	entry: Doc<"journalEntries">,
	userId: string,
): void {
	if (entry.userId !== userId) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "You do not have access to this entry.",
		});
	}
}

export async function getOwnedJournal(
	ctx: QueryCtx | MutationCtx,
	journalId: Id<"journals">,
	userId: string,
): Promise<Doc<"journals">> {
	const journal = await ctx.db.get(journalId);
	if (!journal) {
		throw new ConvexError({
			code: "NOT_FOUND",
			message: "Journal not found.",
		});
	}
	assertJournalOwner(journal, userId);
	return journal;
}
