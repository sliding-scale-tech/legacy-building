import { assets, brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Button } from "@/components/journal/ui/button";

type LibraryEmptyStateProps = {
	onBeginLegacy: () => void;
	className?: string;
};

export function LibraryEmptyState({
	onBeginLegacy,
	className,
}: LibraryEmptyStateProps) {
	return (
		<div
			className={cn(
				"flex w-full flex-col items-center justify-center rounded-[20px]",
				className,
			)}
			style={{
				backgroundColor: brand.libraryMint,
				minHeight: 600,
			}}
		>
			<div className="relative size-[300px] shrink-0 opacity-20">
				<img
					src={assets.libraryEmptyImage}
					alt=""
					className="size-full rounded-[30px] object-contain"
				/>
			</div>
			<p className="font-normal text-[#1a1a1a] text-base leading-[1.4]">
				You haven&apos;t created any journals yet!
			</p>
			<Button
				type="button"
				onClick={onBeginLegacy}
				className="mt-5 min-h-11 w-full max-w-[300px] rounded-xl px-5 font-medium text-sm leading-[1.4] hover:opacity-95"
			>
				Begin your legacy
			</Button>
		</div>
	);
}
