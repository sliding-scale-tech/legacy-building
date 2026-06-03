import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { journalType } from "../schema";
import { assertJournalOwner, requireClerkUserId } from "./auth";
import {
	enrichJournal,
	journalActivityMs,
	resolveEntryImageUrl,
} from "./enrich";
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

/** Most recently updated journal for the desk widget, with carousel image URLs. */
export const getRecentForDesk = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireClerkUserId(ctx);
		const journals = await ctx.db
			.query("journals")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();

		if (journals.length === 0) {
			return null;
		}

		const journal = journals.sort(
			(a, b) => journalActivityMs(b) - journalActivityMs(a),
		)[0];

		const enriched = await enrichJournal(ctx, journal);

		const entries = await ctx.db
			.query("journalEntries")
			.withIndex("by_journalId", (q) => q.eq("journalId", journal._id))
			.collect();

		const sortedEntries = entries.sort((a, b) => b.dateMs - a.dateMs);
		const slideImageUrls: string[] = [];

		for (const entry of sortedEntries) {
			const imageUrl = await resolveEntryImageUrl(ctx, entry);
			if (imageUrl) {
				slideImageUrls.push(imageUrl);
			}
		}

		if (slideImageUrls.length === 0 && enriched.coverImageUrl) {
			slideImageUrls.push(enriched.coverImageUrl);
		}

		return {
			journal: enriched,
			slideImageUrls,
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
