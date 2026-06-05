import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useState } from "react";

type EntryCoverImageProps = {
	imageId?: Id<"_storage">;
	imageUrl?: string;
	className?: string;
};

export function EntryCoverImage({
	imageId,
	imageUrl,
	className,
}: EntryCoverImageProps) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);

	const storageUrl = useQuery(
		api.journal.entries.queries.getEntryImageUrl,
		imageId ? { storageId: imageId } : "skip",
	);

	const src = imageUrl ?? storageUrl ?? undefined;
	const loadError = failedSrc === src;

	if (!src || loadError) {
		return (
			<div
				className={className}
				style={{ backgroundColor: "#f2f2f2" }}
				aria-hidden
			/>
		);
	}

	return (
		<img
			src={src}
			alt=""
			className={className}
			onError={() => setFailedSrc(src)}
		/>
	);
}
