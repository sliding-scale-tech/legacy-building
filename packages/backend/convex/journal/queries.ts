import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { journalType } from "../schema";
import { assertJournalOwner, requireClerkUserId } from "./auth";
import { enrichJournal, resolveEntryImageUrl } from "./enrich";
import { compareJournalsForLibrary } from "./sort";

export const getById = query({
	args: { id: v.id("journals") },
	handler: async (ctx, args) => {
		const userId = await requireClerkUserId(ctx);
		const journal = await ctx.db.get(args.id);
		if (!journal) return null;
		assertJournalOwner(journal, userId);
		return await enrichJournal(ctx, journal);
	},
});

/** Most recently posted journal for the desk widget, with carousel image URLs. */
export const getRecentForDesk = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireClerkUserId(ctx);

		const latestEntry = await ctx.db
			.query("journalEntries")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.order("desc")
			.first();

		let journal: Doc<"journals"> | null = null;
		let postedAtMs: number | undefined;

		if (latestEntry) {
			journal = await ctx.db.get(latestEntry.journalId);
			if (journal && journal.userId !== userId) {
				journal = null;
			} else if (journal) {
				postedAtMs = latestEntry._creationTime;
			}
		}

		if (!journal) {
			journal = await ctx.db
				.query("journals")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.order("desc")
				.first();
			if (journal) {
				postedAtMs = journal._creationTime;
			}
		}

		if (!journal || postedAtMs === undefined) {
			return null;
		}

		const enriched = await enrichJournal(ctx, journal);

		const journalEntries = await ctx.db
			.query("journalEntries")
			.withIndex("by_journalId", (q) => q.eq("journalId", journal._id))
			.collect();

		const sortedEntries = journalEntries.sort((a, b) => b.dateMs - a.dateMs);
		const slideImageUrls = (
			await Promise.all(
				sortedEntries.map((entry) => resolveEntryImageUrl(ctx, entry)),
			)
		).filter((url): url is string => Boolean(url));

		if (slideImageUrls.length === 0 && enriched.coverImageUrl) {
			slideImageUrls.push(enriched.coverImageUrl);
		}

		return {
			journal: enriched,
			slideImageUrls,
			postedAtMs,
		};
	},
});

export const listByType = query({
	args: {
		type: v.optional(journalType),
	},
	handler: async (ctx, args) => {
		const userId = await requireClerkUserId(ctx);
		let journals: Doc<"journals">[];

		if (args.type !== undefined) {
			const storyType = args.type;
			journals = await ctx.db
				.query("journals")
				.withIndex("by_userId_and_type", (q) =>
					q.eq("userId", userId).eq("type", storyType),
				)
				.collect();
		} else {
			journals = await ctx.db
				.query("journals")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect();
		}

		const sorted = [...journals].sort(compareJournalsForLibrary);

		return await Promise.all(
			sorted.map((journal) => enrichJournal(ctx, journal)),
		);
	},
});

/** Resolves a signed URL for a file in Convex storage (used by journal cards). */
export const getCoverImageUrl = query({
	args: { storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		await requireClerkUserId(ctx);
		return await ctx.storage.getUrl(args.storageId);
	},
});
