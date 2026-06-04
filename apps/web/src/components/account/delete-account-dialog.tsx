import { useClerk, useUser } from "@clerk/react";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { firstClerkErrorMessage } from "@legacy-building/ui/lib/clerk-errors";
import { cn } from "@legacy-building/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { accountInputClass } from "@/components/account/accountFormStyles";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@/components/journal/ui/alert-dialog";
import { Input } from "@/components/journal/ui/input";
import {
	messageFromUnknownError,
	toastMutationError,
	toastMutationSuccess,
} from "@/lib/journal/toast";
import { ROUTES } from "@/lib/routes";

const CONFIRM_TEXT = "DELETE";

type DeleteAccountDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function DeleteAccountDialog({
	open,
	onOpenChange,
}: DeleteAccountDialogProps) {
	const { user } = useUser();
	const { signOut } = useClerk();
	const navigate = useNavigate();
	const deleteMyAccount = useMutation(api.user.mutations.deleteMyAccount);
	const [confirmInput, setConfirmInput] = useState("");
	const [deleting, setDeleting] = useState(false);

	const canConfirm = confirmInput.trim() === CONFIRM_TEXT;

	const resetAndClose = () => {
		setConfirmInput("");
		onOpenChange(false);
	};

	const handleDelete = async () => {
		if (!canConfirm || !user) return;
		setDeleting(true);
		try {
			await deleteMyAccount({});
			await user.delete();
			await signOut();
			toastMutationSuccess("Your account has been deleted.");
			resetAndClose();
			void navigate({ to: ROUTES.login });
		} catch (err) {
			const clerkMsg = firstClerkErrorMessage(err);
			toastMutationError(
				err,
				clerkMsg ??
					messageFromUnknownError(
						err,
						"Could not delete account. Please try again.",
					),
			);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				if (!deleting) {
					if (!next) setConfirmInput("");
					onOpenChange(next);
				}
			}}
		>
			<AlertDialogContent
				overlayClassName="z-[2100] bg-[rgba(82,82,82,0.6)]"
				className={cn(
					"fixed top-1/2 right-0 left-0 z-[2101] mx-auto flex w-[calc(100%-32px)] max-w-[440px] flex-col gap-4",
					"!translate-x-0 -translate-y-1/2 rounded-[20px] border-0 bg-white p-5 shadow-lg",
				)}
			>
				<AlertDialogTitle className="font-semibold text-[#b0200c] text-lg">
					Delete account permanently?
				</AlertDialogTitle>
				<AlertDialogDescription className="text-[#525252] text-sm leading-[1.5]">
					This cannot be undone. Your account, all journals, entries, and
					uploaded media will be permanently removed and cannot be recovered.
				</AlertDialogDescription>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="delete-account-confirm"
						className="font-medium text-[#1a1a1a] text-sm"
					>
						Type <span className="font-semibold">{CONFIRM_TEXT}</span> to
						confirm
					</label>
					<Input
						id="delete-account-confirm"
						value={confirmInput}
						onChange={(e) => setConfirmInput(e.target.value)}
						placeholder={CONFIRM_TEXT}
						disabled={deleting}
						autoComplete="off"
						className={accountInputClass}
					/>
				</div>
				<AlertDialogFooter className="mt-2 flex flex-row flex-nowrap items-stretch gap-3 sm:flex-row sm:justify-stretch">
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
						disabled={deleting || !canConfirm}
						className="min-h-11 flex-1 rounded-xl bg-[#b0200c] px-4 text-white leading-[1.4] hover:bg-[#9a1c0a] disabled:opacity-50"
					>
						{deleting ? (
							<>
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Deleting…
							</>
						) : (
							"Delete account"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
