import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";

import { uploadToStorage } from "@/lib/journal/uploadToStorage";

export async function uploadProfilePicture(
	file: File,
	generateUploadUrl: () => Promise<string>,
): Promise<Id<"_storage">> {
	return uploadToStorage(file, generateUploadUrl, file.type || "image/jpeg");
}
