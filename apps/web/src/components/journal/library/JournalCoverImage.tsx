import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useState } from "react";

type JournalCoverImageProps = {
	coverImageId?: Id<"_storage">;
	/** Resolved http(s) URL from list query or persisted at create time */
	coverImageUrl?: string;
};

function isHttpUrl(url: string | undefined): url is string {
	return url?.startsWith("http") ?? false;
}

export function JournalCoverImage({
	coverImageId,
	coverImageUrl,
}: JournalCoverImageProps) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const [refreshFromStorage, setRefreshFromStorage] = useState(false);

	const hasCachedUrl = isHttpUrl(coverImageUrl);
	const shouldFetchStorage =
		Boolean(coverImageId) && (!hasCachedUrl || refreshFromStorage);

	const storageUrl = useQuery(
		api.journal.queries.getCoverImageUrl,
		shouldFetchStorage && coverImageId ? { storageId: coverImageId } : "skip",
	);

	const src = refreshFromStorage
		? (storageUrl ?? undefined)
		: hasCachedUrl
			? coverImageUrl
			: (storageUrl ?? undefined);

	const loadError = failedSrc === src;

	if (!src || loadError) {
		return (
			<span className="text-[#8a8a8a] text-sm">Click to upload an image</span>
		);
	}

	return (
		<img
			src={src}
			alt=""
			loading="lazy"
			decoding="async"
			className="absolute inset-0 size-full object-contain p-3"
			onError={() => {
				if (!refreshFromStorage && coverImageId && hasCachedUrl) {
					setRefreshFromStorage(true);
					return;
				}
				setFailedSrc(src);
			}}
		/>
	);
}
