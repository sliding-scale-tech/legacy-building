import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Plus } from "lucide-react";

import { ImageCarousel } from "@/components/journal/dashboard/ImageCarousel";
import { Button } from "@/components/journal/ui/button";
import { formatDate } from "@/lib/journal/formatDate";

type RecentJournalCardProps = {
	title: string;
	dateMs: number;
	slideImageUrls: string[];
	className?: string;
	onOpenJournal: () => void;
	onAddEntry: () => void;
};

export function RecentJournalCard({
	title,
	dateMs,
	slideImageUrls,
	className,
	onOpenJournal,
	onAddEntry,
}: RecentJournalCardProps) {
	const openAddEntry = (e: React.MouseEvent) => {
		e.stopPropagation();
		onAddEntry();
	};

	return (
		<div
			className={cn("flex w-full max-w-[min(340px,100%)] flex-col", className)}
		>
			<h2 className="mb-2 font-semibold text-[#1a1a1a] text-base leading-[1.4]">
				Recent Journal
			</h2>

			<div
				className={cn(
					"flex w-full flex-col overflow-hidden rounded-xl bg-white",
					"shadow-[2px_2px_4px_0px_rgba(166,166,166,0.35)]",
					"transition-shadow hover:shadow-[2px_4px_8px_0px_rgba(166,166,166,0.4)]",
				)}
			>
				<ImageCarousel
					imageUrls={slideImageUrls}
					alt={title}
					onImageAreaClick={onOpenJournal}
				/>

				<div
					className="flex items-center gap-2 px-3 py-3 sm:px-5"
					style={{ backgroundColor: brand.primary }}
				>
					<button
						type="button"
						onClick={onOpenJournal}
						className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
					>
						<p className="truncate font-semibold text-lg text-white leading-[1.4]">
							{title}
						</p>
						<p
							className="font-normal text-sm leading-none"
							style={{ color: "rgba(255,255,255,0.85)" }}
						>
							{formatDate(dateMs)}
						</p>
					</button>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={openAddEntry}
						className="size-10 shrink-0 rounded-full bg-white hover:bg-white hover:opacity-90"
						aria-label="Add journal entry"
					>
						<Plus
							className="size-5"
							style={{ color: brand.primary }}
							strokeWidth={2.5}
						/>
					</Button>
				</div>
			</div>
		</div>
	);
}
