import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";

export async function uploadToStorage(
	file: File | Blob,
	generateUploadUrl: () => Promise<string>,
	contentType: string,
): Promise<Id<"_storage">> {
	const uploadUrl = await generateUploadUrl();
	const response = await fetch(uploadUrl, {
		method: "POST",
		headers: { "Content-Type": contentType },
		body: file,
	});

	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		throw new Error(
			detail
				? `Upload failed (${response.status}): ${detail}`
				: `Upload failed (${response.status})`,
		);
	}

	const json = (await response.json()) as { storageId?: Id<"_storage"> };
	if (!json.storageId) {
		throw new Error("Upload failed: server did not return a storage id");
	}
	return json.storageId;
}
