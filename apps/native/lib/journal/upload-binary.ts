import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { File, UploadType } from "expo-file-system";

/**
 * Shared binary uploader for any Convex storage URL. Used by:
 *  - profile picture upload (avatar)
 *  - journal cover image upload
 *  - journal entry image / audio upload
 *
 * IMPORTANT: this uses the MODERN `expo-file-system` `File` API, not the
 * deprecated `expo-file-system/legacy` `uploadAsync`.
 *
 * Why: in Expo Go the legacy file system is sandboxed to the experience's
 * scoped directory, but `expo-audio` writes recordings to the shared
 * `cache/Audio/...` path which falls OUTSIDE that scope. The legacy
 * `uploadAsync`/`copyAsync` then reject it with
 * `java.io.IOException: ... isn't readable`, even though the file is perfectly
 * fine (the audio player can read it). The modern `File` API operates on real
 * paths without that scoping restriction.
 *
 * We try `File.upload()` (native, single round trip) first, then fall back to
 * a native byte read + manual `fetch` POST. A fresh upload URL is requested per
 * attempt because Convex upload URLs are single-use.
 */
export async function uploadBinaryToConvex(args: {
	uri: string;
	mimeType: string;
	generateUploadUrl: () => Promise<string>;
}): Promise<Id<"_storage">> {
	const file = new File(args.uri);

	// --- Primary: modern native upload --------------------------------------
	try {
		const uploadUrl = await args.generateUploadUrl();
		const result = await file.upload(uploadUrl, {
			httpMethod: "POST",
			uploadType: UploadType.BINARY_CONTENT,
			headers: { "Content-Type": args.mimeType },
		});
		return parseUploadResult(result.status, result.body);
	} catch (primaryError) {
		// --- Fallback: native byte read + fetch POST ------------------------
		try {
			const bytes = await file.bytes();
			if (!bytes || bytes.byteLength === 0) {
				throw new ConvexError({
					code: "UPLOAD_FAILED",
					message: "The recording was empty or could not be read.",
				});
			}
			const uploadUrl = await args.generateUploadUrl();
			const response = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": args.mimeType },
				// Uint8Array is an ArrayBufferView; RN fetch sends the raw bytes.
				body: bytes,
			});
			const text = await response.text();
			return parseUploadResult(response.status, text);
		} catch (fallbackError) {
			if (fallbackError instanceof ConvexError) throw fallbackError;
			if (primaryError instanceof ConvexError) throw primaryError;
			throw new ConvexError({
				code: "UPLOAD_FAILED",
				message:
					fallbackError instanceof Error
						? fallbackError.message
						: "Could not upload the file.",
			});
		}
	}
}

function parseUploadResult(status: number, body: string): Id<"_storage"> {
	if (status < 200 || status >= 300) {
		throw new ConvexError({
			code: "UPLOAD_FAILED",
			message: `Upload failed (status ${status}).`,
		});
	}

	let parsed: { storageId?: Id<"_storage"> };
	try {
		parsed = JSON.parse(body) as { storageId?: Id<"_storage"> };
	} catch {
		throw new ConvexError({
			code: "UPLOAD_FAILED",
			message: "Upload response was not valid JSON.",
		});
	}
	if (!parsed.storageId) {
		throw new ConvexError({
			code: "UPLOAD_FAILED",
			message: "Upload response did not include a storage id.",
		});
	}
	return parsed.storageId;
}
