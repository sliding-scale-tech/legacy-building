import type { Doc, Id } from "../_generated/dataModel";

export const DOCUGENERATE_URL = "https://api.docugenerate.com/v1/document";
export const PEECHO_PUBLICATION_URL =
	"https://www.peecho.com/rest/v2/publication/create";

export const DOCUGENERATE_TEMPLATE_IDS = {
	my_story: "Z4tiXWnYwPWKuxzYgVji",
	their_story: "QXlgtyJlnKdT13ymRvyp",
} as const;

export type DocugenerateJournalEntry = {
	image: string;
	journal_title: string;
	entry_date: string;
	journal_entry: string;
};

export function requireDocugenerateApiKey(): string {
	const key = process.env.DOCUGENERATE_API_KEY;
	if (!key) {
		throw new Error(
			"Book ordering is not configured. Set DOCUGENERATE_API_KEY in Convex environment variables.",
		);
	}
	return key;
}

export function requirePeechoConfig(): {
	apiKey: string;
	buttonKey: string;
	checkoutBaseUrl: string;
} {
	const apiKey = process.env.PEECHO_API_KEY;
	const buttonKey = process.env.PEECHO_BUTTON_KEY;
	if (!apiKey || !buttonKey) {
		throw new Error(
			"Book ordering is not configured. Set PEECHO_API_KEY and PEECHO_BUTTON_KEY in Convex environment variables.",
		);
	}

	return {
		apiKey,
		buttonKey,
		checkoutBaseUrl:
			process.env.PEECHO_CHECKOUT_BASE_URL ?? "https://www.peecho.com/print",
	};
}

export function formatOrderEntryDate(ms: number): string {
	return new Date(ms).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function mapEntriesForDocugenerate(
	entries: Array<{
		title: string;
		dateMs: number;
		body?: string;
		imageUrl?: string;
	}>,
): DocugenerateJournalEntry[] {
	return entries.map((entry) => ({
		image: entry.imageUrl ?? "",
		journal_title: entry.title?.trim() || "Untitled entry",
		entry_date: formatOrderEntryDate(entry.dateMs),
		journal_entry: entry.body?.trim() ?? "",
	}));
}

/** Rough page count for Peecho product selection (cover + ~2 pages per entry). */
export function estimateBookPages(
	entryCount: number,
	includeJournal: boolean,
): number {
	const coverPages = includeJournal ? 4 : 0;
	return Math.max(24, coverPages + entryCount * 2);
}

export function buildPeechoReferenceId(journalId: Id<"journals">): string {
	return `${journalId}-${Date.now()}`;
}

type DocugenerateResponse = {
	document_uri?: string;
};

type PeechoPublicationResponse = Record<string, unknown>;

async function parsePeechoResponseBody(response: Response): Promise<unknown> {
	const text = (await response.text()).trim();
	if (!text) return null;

	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

function extractPeechoPublicationId(payload: unknown): string | null {
	if (typeof payload === "number" && Number.isFinite(payload)) {
		return String(Math.trunc(payload));
	}

	if (typeof payload === "string") {
		const trimmed = payload.trim();
		if (!trimmed) return null;
		if (/^\d+$/.test(trimmed)) return trimmed;
		if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
			return trimmed;
		}

		try {
			return extractPeechoPublicationId(JSON.parse(trimmed) as unknown);
		} catch {
			return trimmed;
		}
	}

	if (typeof payload !== "object" || payload === null) {
		return null;
	}

	const record = payload as PeechoPublicationResponse;
	const candidates = [
		record.id,
		record.publicationId,
		record.publication_id,
		typeof record.publication === "object" && record.publication !== null
			? (record.publication as PeechoPublicationResponse).id
			: undefined,
		typeof record.order === "object" && record.order !== null
			? (record.order as PeechoPublicationResponse).id
			: undefined,
		typeof record.order === "object" && record.order !== null
			? (record.order as PeechoPublicationResponse).product
			: undefined,
	];

	for (const candidate of candidates) {
		if (candidate === undefined || candidate === null) continue;
		if (typeof candidate === "object") {
			const nested = extractPeechoPublicationId(candidate);
			if (nested) return nested;
			continue;
		}
		const value = String(candidate).trim();
		if (value.length > 0) return value;
	}

	const checkoutUrl =
		typeof record.checkoutUrl === "string"
			? record.checkoutUrl
			: typeof record.checkout_url === "string"
				? record.checkout_url
				: typeof record.url === "string"
					? record.url
					: null;

	if (checkoutUrl) return checkoutUrl;

	return null;
}

function summarizePeechoPayload(payload: unknown): string {
	if (typeof payload === "string") return payload.slice(0, 200);
	try {
		return JSON.stringify(payload).slice(0, 200);
	} catch {
		return String(payload).slice(0, 200);
	}
}

export async function generateBookPdf(args: {
	templateId: string;
	bookName: string;
	dedicationLine: string;
	journalEntries: DocugenerateJournalEntry[];
}): Promise<string> {
	const response = await fetch(DOCUGENERATE_URL, {
		method: "POST",
		headers: {
			Authorization: requireDocugenerateApiKey(),
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			template_id: args.templateId,
			data: [
				{
					book_name: args.bookName,
					dedication_line: args.dedicationLine,
					journal_entries: args.journalEntries,
				},
			],
			file: "",
			sheet: "",
			name: "",
			output_name: "",
			output_format: ".pdf",
			output_quality: 100,
			single_file: true,
			page_break: true,
			merge_with: "",
			attach: "",
		}),
	});

	const payload = (await response.json()) as DocugenerateResponse & {
		message?: string;
		error?: string;
	};

	if (!response.ok) {
		throw new Error(
			payload.message ??
				payload.error ??
				`DocuGenerate failed with status ${response.status}.`,
		);
	}

	if (!payload.document_uri) {
		throw new Error("DocuGenerate did not return a PDF URL.");
	}

	return payload.document_uri;
}

export async function createPeechoPublication(args: {
	title: string;
	pdfUrl: string;
	pages: number;
	thumbnailUrl: string;
	referenceId: string;
}): Promise<string> {
	const { apiKey, buttonKey, checkoutBaseUrl } = requirePeechoConfig();

	const response = await fetch(PEECHO_PUBLICATION_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			apiKey,
			buttonKey,
			currency: "USD",
			locale: "en",
			order: {
				reference: args.referenceId,
				product: {
					title: args.title,
					source: {
						file: {
							src: args.pdfUrl,
							pages: args.pages,
							dimensions: {
								height: 297,
								width: 210,
							},
						},
					},
					thumbnail: {
						src: args.thumbnailUrl,
					},
				},
			},
		}),
	});

	const payload = await parsePeechoResponseBody(response);

	if (!response.ok) {
		const record =
			typeof payload === "object" && payload !== null
				? (payload as PeechoPublicationResponse)
				: null;
		throw new Error(
			(typeof record?.message === "string" ? record.message : undefined) ??
				(typeof record?.error === "string" ? record.error : undefined) ??
				(typeof payload === "string" ? payload : undefined) ??
				`Peecho failed with status ${response.status}.`,
		);
	}

	const publicationId = extractPeechoPublicationId(payload);
	if (!publicationId) {
		throw new Error(
			`Peecho did not return a publication id. Response: ${summarizePeechoPayload(payload)}`,
		);
	}

	if (
		publicationId.startsWith("http://") ||
		publicationId.startsWith("https://")
	) {
		return publicationId;
	}

	return `${checkoutBaseUrl.replace(/\/$/, "")}/${publicationId}`;
}

export function resolveThumbnailUrl(args: {
	journal: Pick<Doc<"journals">, "coverImageUrl"> & {
		coverImageUrl?: string;
	};
	entries: Array<{ imageUrl?: string }>;
	pdfUrl: string;
}): string {
	return (
		args.journal.coverImageUrl ??
		args.entries.find((entry) => entry.imageUrl)?.imageUrl ??
		args.pdfUrl
	);
}
