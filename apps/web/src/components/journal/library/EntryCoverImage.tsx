import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

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
	const [loadError, setLoadError] = useState(false);

	const storageUrl = useQuery(
		api.journal.entries.queries.getEntryImageUrl,
		imageId ? { storageId: imageId } : "skip",
	);

	const src = imageUrl ?? storageUrl ?? undefined;

	useEffect(() => {
		setLoadError(false);
	}, [src]);

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
			onError={() => setLoadError(true)}
		/>
	);
}
