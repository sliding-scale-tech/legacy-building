import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { useCallback, useEffect, useState } from "react";

type ImageCarouselProps = {
	imageUrls: string[];
	alt: string;
	className?: string;
	intervalMs?: number;
};

export function ImageCarousel({
	imageUrls,
	alt,
	className,
	intervalMs = 4000,
}: ImageCarouselProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const count = imageUrls.length;

	const goTo = useCallback(
		(index: number) => {
			if (count === 0) return;
			setActiveIndex(((index % count) + count) % count);
		},
		[count],
	);

	useEffect(() => {
		setActiveIndex(0);
	}, [imageUrls]);

	useEffect(() => {
		if (count <= 1) return;
		const id = window.setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % count);
		}, intervalMs);
		return () => window.clearInterval(id);
	}, [count, intervalMs, imageUrls]);

	if (count === 0) {
		return (
			<div
				className={cn(
					"flex h-[200px] w-full items-center justify-center bg-white",
					className,
				)}
			>
				<span className="text-[#8a8a8a] text-sm">No image</span>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"relative h-[200px] w-full overflow-hidden bg-white",
				className,
			)}
		>
			<div
				className="flex h-full transition-transform duration-500 ease-in-out"
				style={{ transform: `translateX(-${activeIndex * 100}%)` }}
			>
				{imageUrls.map((url) => (
					<img
						key={url}
						src={url}
						alt={alt}
						className="h-[200px] w-full shrink-0 object-contain"
						draggable={false}
					/>
				))}
			</div>

			{count > 1 ? (
				<ul className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
					{imageUrls.map((url, index) => {
						const active = index === activeIndex;
						return (
							<li key={`dot-${url}`}>
								<button
									type="button"
									onClick={() => goTo(index)}
									className="flex size-2.5 cursor-pointer items-center justify-center rounded-full p-0"
									aria-label={`Slide ${index + 1}`}
									aria-current={active ? "true" : undefined}
								>
									<span
										className={cn(
											"block size-2 rounded-full transition-colors",
											active ? "scale-110" : "opacity-70",
										)}
										style={{
											backgroundColor: active ? brand.primary : "#d4d4d4",
										}}
									/>
								</button>
							</li>
						);
					})}
				</ul>
			) : null}
		</div>
	);
}
