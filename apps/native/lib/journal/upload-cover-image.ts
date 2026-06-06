import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { FileSystemUploadType, uploadAsync } from "expo-file-system/legacy";

import type { PickProfileImageResult } from "@/lib/account/upload-profile-picture";

/**
 * Reuses the picker shape from the profile-pic flow. Re-export the picker
 * helper from there to avoid duplicating permission + validation logic.
 */
export { pickProfileImage as pickCoverImage } from "@/lib/account/upload-profile-picture";
export type PickCoverImageResult = PickProfileImageResult;

type PickedImage = {
	uri: string;
	mimeType: string;
	sizeBytes: number;
};

/**
 * Uploads a picked journal cover image to Convex storage. Mirrors the
 * profile-picture upload path (native streaming via expo-file-system).
 */
export async function uploadCoverImage(
	image: PickedImage,
	generateUploadUrl: () => Promise<string>,
): Promise<Id<"_storage">> {
	const uploadUrl = await generateUploadUrl();

	const result = await uploadAsync(uploadUrl, image.uri, {
		httpMethod: "POST",
		uploadType: FileSystemUploadType.BINARY_CONTENT,
		headers: { "Content-Type": image.mimeType },
	});

	if (result.status < 200 || result.status >= 300) {
		throw new ConvexError({
			code: "UPLOAD_FAILED",
			message: `Cover upload failed (status ${result.status}).`,
		});
	}

	let parsed: { storageId?: Id<"_storage"> };
	try {
		parsed = JSON.parse(result.body) as { storageId?: Id<"_storage"> };
	} catch {
		throw new ConvexError({
			code: "UPLOAD_FAILED",
			message: "Cover upload response was not valid JSON.",
		});
	}
	if (!parsed.storageId) {
		throw new ConvexError({
			code: "UPLOAD_FAILED",
			message: "Cover upload response did not include a storage id.",
		});
	}
	return parsed.storageId;
}
