import type { Doc } from "@legacy-building/backend/convex/_generated/dataModel";
import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Plus } from "lucide-react";
import { JournalCoverImage } from "@/components/journal/library/JournalCoverImage";
import { Button } from "@/components/journal/ui/button";
import { formatDate } from "@/lib/journal/formatDate";

type JournalCardProps = {
	journal: Doc<"journals">;
	onOpen: () => void;
	onAddEntry: () => void;
};

export function JournalCard({ journal, onOpen, onAddEntry }: JournalCardProps) {
	return (
		<article
			className={cn(
				"flex w-full max-w-[500px] flex-col overflow-hidden rounded-xl",
				"shadow-[2px_2px_4px_0_#a6a6a6] transition-shadow hover:shadow-[2px_4px_8px_0_#a6a6a6]",
			)}
		>
			<button
				type="button"
				onClick={onOpen}
				className="flex cursor-pointer flex-col text-left"
			>
				<div
					className="relative flex h-[150px] w-full items-center justify-center bg-white"
					style={{ borderRadius: "12px 12px 0 0" }}
				>
					<JournalCoverImage
						coverImageId={journal.coverImageId}
						coverImageUrl={journal.coverImageUrl}
					/>
				</div>
			</button>
			<div
				className="flex items-center gap-2 px-5 py-3"
				style={{ backgroundColor: brand.primary }}
			>
				<button
					type="button"
					onClick={onOpen}
					className="flex min-w-0 flex-1 cursor-pointer flex-col gap-2 text-left"
				>
					<h3 className="truncate font-semibold text-lg text-white leading-[1.4]">
						{journal.title}
					</h3>
					<p
						className="font-normal text-sm leading-none"
						style={{ color: brand.dateMuted }}
					>
						{formatDate(journal.dateMs)}
					</p>
				</button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={(e) => {
						e.stopPropagation();
						onAddEntry();
					}}
					className="size-10 shrink-0 rounded-full bg-white hover:bg-white hover:opacity-90"
					aria-label={`Add entry to ${journal.title}`}
				>
					<Plus
						className="size-5"
						style={{ color: brand.primary }}
						strokeWidth={2.5}
					/>
				</Button>
			</div>
		</article>
	);
}
