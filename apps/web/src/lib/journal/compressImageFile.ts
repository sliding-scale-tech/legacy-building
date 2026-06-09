const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const SKIP_COMPRESS_BELOW_BYTES = 400_000;

/** Resize large photos before upload so storage + page loads stay fast. */
export async function compressImageFile(file: File): Promise<File> {
	if (!file.type.startsWith("image/") || file.type === "image/gif") {
		return file;
	}
	if (file.size <= SKIP_COMPRESS_BELOW_BYTES) {
		return file;
	}

	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file);
	} catch {
		return file;
	}

	const scale = Math.min(
		1,
		MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
	);
	if (scale >= 1) {
		bitmap.close();
		return file;
	}

	const width = Math.round(bitmap.width * scale);
	const height = Math.round(bitmap.height * scale);
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	if (!ctx) {
		bitmap.close();
		return file;
	}

	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();

	const blob = await new Promise<Blob | null>((resolve) => {
		canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
	});
	if (!blob) return file;

	const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
	return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
