import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

type JournalCoverImageProps = {
	coverImageId?: Id<"_storage">;
	/** Resolved http(s) URL from list query or persisted at create time */
	coverImageUrl?: string;
};

export function JournalCoverImage({
	coverImageId,
	coverImageUrl,
}: JournalCoverImageProps) {
	const [loadError, setLoadError] = useState(false);

	const storageUrl = useQuery(
		api.journal.queries.getCoverImageUrl,
		coverImageId ? { storageId: coverImageId } : "skip",
	);

	const src = coverImageId
		? (storageUrl ?? coverImageUrl)
		: coverImageUrl?.startsWith("http")
			? coverImageUrl
			: undefined;

	useEffect(() => {
		setLoadError(false);
	}, [src]);

	if (!src || loadError) {
		return (
			<span className="text-[#8a8a8a] text-sm">Click to upload an image</span>
		);
	}

	return (
		<img
			src={src}
			alt=""
			className="absolute inset-0 size-full object-contain p-3"
			onError={() => setLoadError(true)}
		/>
	);
}
