import { ConvexError, v } from "convex/values";

import { type MutationCtx, mutation } from "../_generated/server";
import { journalType } from "../schema";
import { getOwnedJournal, requireClerkUserId } from "./auth";
import { journalLibrarySortKey } from "./sort";
import { deleteEntryStorageFiles, deleteJournalCoverStorage } from "./storage";

async function nextSortOrderForType(
	ctx: MutationCtx,
	userId: string,
	type: "my_story" | "their_story",
): Promise<number> {
	const journals = await ctx.db
		.query("journals")
		.withIndex("by_userId_and_type", (q) =>
			q.eq("userId", userId).eq("type", type),
		)
		.collect();

	let max = 0;
	for (const journal of journals) {
		max = Math.max(max, journalLibrarySortKey(journal));
	}
	return max + 1000;
}

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		await requireClerkUserId(ctx);
		return await ctx.storage.generateUploadUrl();
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		dateMs: v.number(),
		type: journalType,
		dedication: v.optional(v.string()),
		/** Cover image is now optional — native create flow allows text-only journals. */
		coverImageId: v.optional(v.id("_storage")),
		/** Optional period end date. */
		endDateMs: v.optional(v.number()),
		/** Optional inline entry log captured at creation time. */
		entryLog: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireClerkUserId(ctx);

		if (args.endDateMs !== undefined && args.endDateMs < args.dateMs) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "End date must be on or after the start date.",
			});
		}

		let coverImageUrl: string | undefined;
		if (args.coverImageId) {
			const resolved = await ctx.storage.getUrl(args.coverImageId);
			if (!resolved) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message:
						"Cover image was not found in storage. Please upload the image again.",
				});
			}
			coverImageUrl = resolved;
		}

		const trimmedEntryLog = args.entryLog?.trim();

		const now = Date.now();
		const sortOrder = await nextSortOrderForType(ctx, userId, args.type);
		return await ctx.db.insert("journals", {
			userId,
			title: args.title,
			dateMs: args.dateMs,
			type: args.type,
			dedication: args.dedication,
			coverImageId: args.coverImageId,
			coverImageUrl,
			endDateMs: args.endDateMs,
			entryLog: trimmedEntryLog ? trimmedEntryLog : undefined,
			updatedAtMs: now,
			sortOrder,
		});
	},
});

/** Persists drag-and-drop order for journals in a story tab. */
export const reorder = mutation({
	args: {
		type: journalType,
		orderedIds: v.array(v.id("journals")),
	},
	handler: async (ctx, args) => {
		const userId = await requireClerkUserId(ctx);
		const journals = await ctx.db
			.query("journals")
			.withIndex("by_userId_and_type", (q) =>
				q.eq("userId", userId).eq("type", args.type),
			)
			.collect();

		if (args.orderedIds.length !== journals.length) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Reorder list must include every journal in this story tab.",
			});
		}

		const ownedIds = new Set(journals.map((j) => j._id));
		const seen = new Set<string>();
		for (const id of args.orderedIds) {
			if (!ownedIds.has(id)) {
				throw new ConvexError({
					code: "FORBIDDEN",
					message: "You do not have access to one or more journals.",
				});
			}
			if (seen.has(id)) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Duplicate journal in reorder list.",
				});
			}
			seen.add(id);
		}

		for (const [index, journalId] of args.orderedIds.entries()) {
			await ctx.db.patch(journalId, { sortOrder: index * 1000 });
		}
	},
});

export const update = mutation({
	args: {
		id: v.id("journals"),
		title: v.string(),
		dateMs: v.number(),
		dedication: v.optional(v.string()),
		coverImageId: v.optional(v.id("_storage")),
	},
	handler: async (ctx, args) => {
		const userId = await requireClerkUserId(ctx);
		const journal = await getOwnedJournal(ctx, args.id, userId);

		let coverImageId = journal.coverImageId;
		let coverImageUrl = journal.coverImageUrl;

		if (
			args.coverImageId !== undefined &&
			args.coverImageId !== journal.coverImageId
		) {
			await deleteJournalCoverStorage(ctx, journal);
			const url = await ctx.storage.getUrl(args.coverImageId);
			if (!url) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Cover image was not found in storage.",
				});
			}
			coverImageId = args.coverImageId;
			coverImageUrl = url;
		}

		await ctx.db.patch(args.id, {
			title: args.title.trim(),
			dateMs: args.dateMs,
			dedication: args.dedication,
			coverImageId,
			coverImageUrl,
			updatedAtMs: Date.now(),
		});
	},
});

export const remove = mutation({
	args: { id: v.id("journals") },
	handler: async (ctx, args) => {
		const userId = await requireClerkUserId(ctx);
		const journal = await getOwnedJournal(ctx, args.id, userId);

		const entries = await ctx.db
			.query("journalEntries")
			.withIndex("by_journalId", (q) => q.eq("journalId", args.id))
			.collect();

		for (const entry of entries) {
			await deleteEntryStorageFiles(ctx, entry);
			await ctx.db.delete(entry._id);
		}

		await deleteJournalCoverStorage(ctx, journal);
		await ctx.db.delete(args.id);
	},
});
