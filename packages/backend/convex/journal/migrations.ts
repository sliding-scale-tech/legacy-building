import { internalMutation } from "../_generated/server";

/** Rewrites journals and journalEntries from legacy seed field names */
export const migrateLegacyLibraryData = internalMutation({
	args: {},
	handler: async (ctx) => {
		let journalsMigrated = 0;
		const journals = await ctx.db.query("journals").collect();

		for (const journal of journals) {
			const row = journal as typeof journal & {
				journalDate?: number;
				dedicationLine?: string;
				createdAt?: number;
			};

			const dateMs = row.dateMs ?? row.journalDate;
			if (dateMs === undefined) {
				continue;
			}

			const needsReplace =
				row.dateMs === undefined ||
				row.journalDate !== undefined ||
				row.dedicationLine !== undefined ||
				row.createdAt !== undefined;

			if (!needsReplace) {
				continue;
			}

			await ctx.db.replace(row._id, {
				userId: row.userId,
				title: row.title,
				dateMs,
				type: row.type,
				dedication: row.dedication ?? row.dedicationLine,
				coverImageUrl: row.coverImageUrl?.startsWith("http")
					? row.coverImageUrl
					: undefined,
				coverImageId: row.coverImageId,
			});
			journalsMigrated += 1;
		}

		let entriesMigrated = 0;
		const entries = await ctx.db.query("journalEntries").collect();

		for (const entry of entries) {
			const row = entry as typeof entry & {
				entryDate?: number;
				source?: string;
				createdAt?: number;
			};

			const dateMs = row.dateMs ?? row.entryDate;
			if (dateMs === undefined) {
				continue;
			}

			const mode =
				row.mode ??
				(row.source === "recording"
					? ("recording" as const)
					: ("writing" as const));

			const needsReplace =
				row.dateMs === undefined ||
				row.mode === undefined ||
				row.entryDate !== undefined ||
				row.source !== undefined ||
				row.createdAt !== undefined;

			if (!needsReplace) {
				continue;
			}

			await ctx.db.replace(row._id, {
				userId: row.userId,
				journalId: row.journalId,
				title: row.title,
				dateMs,
				body: row.body,
				mode,
				imageUrl: row.imageUrl,
				audioUrl: row.audioUrl,
			});
			entriesMigrated += 1;
		}

		return {
			journalsMigrated,
			journalsTotal: journals.length,
			entriesMigrated,
			entriesTotal: entries.length,
		};
	},
});

/** Sets journal.updatedAtMs from latest entry or journal creation time. */
export const backfillJournalUpdatedAt = internalMutation({
	args: {},
	handler: async (ctx) => {
		let updated = 0;
		const journals = await ctx.db.query("journals").collect();

		for (const journal of journals) {
			const entries = await ctx.db
				.query("journalEntries")
				.withIndex("by_journalId", (q) => q.eq("journalId", journal._id))
				.collect();

			const latestEntryMs = entries.reduce(
				(max, entry) => Math.max(max, entry._creationTime),
				0,
			);
			const activityMs = Math.max(journal._creationTime, latestEntryMs);

			if (journal.updatedAtMs === activityMs) {
				continue;
			}

			await ctx.db.patch(journal._id, { updatedAtMs: activityMs });
			updated += 1;
		}

		return { updated, journalsTotal: journals.length };
	},
});

/** Removes invalid coverImageUrl values (e.g. blob: URLs) that cannot be displayed. */
export const scrubInvalidCoverUrls = internalMutation({
	args: {},
	handler: async (ctx) => {
		let updated = 0;
		const journals = await ctx.db.query("journals").collect();

		for (const journal of journals) {
			const url = journal.coverImageUrl;
			if (!url) continue;
			if (url.startsWith("https://") || url.startsWith("http://")) continue;

			await ctx.db.patch(journal._id, { coverImageUrl: undefined });
			updated += 1;
		}

		return { updated, journalsTotal: journals.length };
	},
});
