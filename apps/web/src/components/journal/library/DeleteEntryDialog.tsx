import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { cn } from "@legacy-building/ui/lib/utils";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@/components/journal/ui/alert-dialog";
import { toastMutationError, toastMutationSuccess } from "@/lib/journal/toast";

type DeleteEntryDialogProps = {
	entryId: Id<"journalEntries"> | null;
	entryTitle?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleted?: () => void;
};

export function DeleteEntryDialog({
	entryId,
	entryTitle,
	open,
	onOpenChange,
	onDeleted,
}: DeleteEntryDialogProps) {
	const removeEntry = useMutation(api.journal.entries.mutations.remove);
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!entryId) return;
		setDeleting(true);
		try {
			await removeEntry({ id: entryId });
			toastMutationSuccess("Entry deleted.");
			onOpenChange(false);
			onDeleted?.();
		} catch (err) {
			toastMutationError(err, "Could not delete entry. Please try again.");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent
				overlayClassName="z-[2100] bg-[rgba(82,82,82,0.6)]"
				className={cn(
					"fixed top-1/2 right-0 left-0 z-[2101] mx-auto flex w-[calc(100%-32px)] max-w-[400px] flex-col gap-4",
					"!translate-x-0 -translate-y-1/2 rounded-[20px] border-0 bg-white p-5 shadow-lg",
				)}
			>
				<AlertDialogTitle className="font-semibold text-[#1a1a1a] text-lg">
					Delete entry?
				</AlertDialogTitle>
				<AlertDialogDescription className="mt-2 text-[#525252] text-sm leading-[1.4]">
					{entryTitle
						? `"${entryTitle}" will be permanently removed.`
						: "This entry will be permanently removed."}
				</AlertDialogDescription>
				<AlertDialogFooter className="mt-6 flex flex-row flex-nowrap items-stretch gap-3 sm:flex-row sm:justify-stretch">
					<AlertDialogCancel
						disabled={deleting}
						className="min-h-11 flex-1 rounded-xl bg-[#f2f2f2] px-4 text-[#525252] leading-[1.4] hover:opacity-90"
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							void handleDelete();
						}}
						disabled={deleting || !entryId}
						className="min-h-11 flex-1 rounded-xl bg-[#b0200c] px-4 text-white leading-[1.4] hover:bg-[#9a1c0a]"
					>
						{deleting ? "Deleting…" : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
