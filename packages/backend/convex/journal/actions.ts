"use node";

import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import {
	buildPeechoReferenceId,
	createPeechoPublication,
	DOCUGENERATE_TEMPLATE_IDS,
	estimateBookPages,
	generateBookPdf,
	mapEntriesForDocugenerate,
	resolveThumbnailUrl,
} from "./orderHelpers";

export const createBookOrderCheckout = action({
	args: {
		journalId: v.id("journals"),
		entryIds: v.array(v.id("journalEntries")),
		includeJournal: v.boolean(),
	},
	returns: v.object({ checkoutUrl: v.string() }),
	handler: async (ctx, args): Promise<{ checkoutUrl: string }> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "You must be signed in to order a book.",
			});
		}

		const { journal, entries } = await ctx.runQuery(
			internal.journal.orderQueries.getBookOrderData,
			{
				journalId: args.journalId,
				entryIds: args.entryIds,
				clerkUserId: identity.subject,
			},
		);

		const templateId = DOCUGENERATE_TEMPLATE_IDS[journal.type];
		const bookName = journal.title?.trim() || "My Legacy Book";
		const dedicationLine = journal.dedication?.trim() ?? "";
		const journalEntries = mapEntriesForDocugenerate(entries);

		let pdfUrl: string;
		try {
			pdfUrl = await generateBookPdf({
				templateId,
				bookName,
				dedicationLine,
				journalEntries,
			});
		} catch (error) {
			throw new ConvexError({
				code: "PDF_GENERATION_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Could not generate the book PDF.",
			});
		}

		const pages = estimateBookPages(entries.length, args.includeJournal);
		const thumbnailUrl = resolveThumbnailUrl({
			journal,
			entries,
			pdfUrl,
		});
		const referenceId = buildPeechoReferenceId(journal._id);

		let checkoutUrl: string;
		try {
			checkoutUrl = await createPeechoPublication({
				title: bookName,
				pdfUrl,
				pages,
				thumbnailUrl,
				referenceId,
			});
		} catch (error) {
			throw new ConvexError({
				code: "PEECHO_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Could not start the print checkout.",
			});
		}

		if (
			checkoutUrl.startsWith("http://") ||
			checkoutUrl.startsWith("https://")
		) {
			return { checkoutUrl };
		}

		return {
			checkoutUrl: `https://www.peecho.com${checkoutUrl.startsWith("/") ? checkoutUrl : `/${checkoutUrl}`}`,
		};
	},
});
