import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { File, Paths, UploadType } from "expo-file-system";

/**
 * Shared binary uploader for any Convex storage URL. Used by:
 *  - profile picture upload (avatar)
 *  - journal cover image upload
 *  - journal entry image / audio upload
 *
 * Uses the modern `expo-file-system` `File` API (not the deprecated
 * `expo-file-system/legacy` `uploadAsync`). The legacy uploader fails to read
 * freshly-written cache files on Android — notably expo-audio recordings,
 * which raise `java.io.IOException: ... isn't readable`. The new `File.upload`
 * goes through the maintained native file path and handles cache URIs.
 *
 * For audio (or any file we just wrote to the OS cache), we first copy it into
 * our app's cache directory so we control a stable, definitely-readable source
 * before uploading.
 */
export async function uploadBinaryToConvex(args: {
	uri: string;
	mimeType: string;
	generateUploadUrl: () => Promise<string>;
}): Promise<Id<"_storage">> {
	const source = await ensureReadableFile(args.uri);

	if (!source.exists) {
		throw new ConvexError({
			code: "UPLOAD_FAILED",
			message: "The file to upload could not be found on disk.",
		});
	}

	const uploadUrl = await args.generateUploadUrl();

	const result = await source.upload(uploadUrl, {
		httpMethod: "POST",
		uploadType: UploadType.BINARY_CONTENT,
		headers: { "Content-Type": args.mimeType },
	});

	if (result.status < 200 || result.status >= 300) {
		throw new ConvexError({
			code: "UPLOAD_FAILED",
			message: `Upload failed (status ${result.status}).`,
		});
	}

	let parsed: { storageId?: Id<"_storage"> };
	try {
		parsed = JSON.parse(result.body) as { storageId?: Id<"_storage"> };
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

/**
 * Returns a `File` we can reliably read. The source is always a transient
 * cache file (just-picked image or just-recorded audio), so we stage a fresh
 * copy in our own cache directory and upload that. The native copy reads the
 * source and writes a clean, definitely-readable file — this sidesteps the
 * "isn't readable" IOException some Android recordings throw on direct upload.
 *
 * If the copy fails for any reason we fall back to the original file.
 */
async function ensureReadableFile(uri: string): Promise<File> {
	const original = new File(uri);
	const extension = original.extension || ".bin";
	const destination = new File(
		Paths.cache,
		`upload-${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`,
	);

	try {
		await original.copy(destination);
		if (destination.exists) {
			return destination;
		}
	} catch {
		// Copy failed (e.g. unusual URI scheme) — upload the original directly.
	}
	return original;
}
