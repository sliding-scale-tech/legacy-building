import { Button } from "@legacy-building/ui/components/button";
import { useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/journal/ui/dialog";
import { ROUTES } from "@/lib/routes";

type JournalPaywallDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function JournalPaywallDialog({
	open,
	onOpenChange,
}: JournalPaywallDialogProps) {
	const navigate = useNavigate();

	const goToBilling = () => {
		onOpenChange(false);
		void navigate({ to: ROUTES.dashboardBilling });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton
				overlayBlur={false}
				overlayClassName="bg-transparent"
				className="max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-lg"
			>
				<DialogHeader className="items-center gap-3 text-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-[#ebf6f6]">
						<Lock className="size-5 text-[#008080]" aria-hidden />
					</div>
					<DialogTitle className="font-semibold text-[#1a1a1a] text-xl">
						Subscribe to unlock journals
					</DialogTitle>
					<DialogDescription className="text-[#525252] text-sm leading-relaxed">
						Complete payment to create journals, add entries, and preserve your
						legacy. You can browse the app freely until you&apos;re ready.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="mt-2 flex-col gap-2 sm:flex-col">
					<Button
						type="button"
						className="h-11 w-full rounded-xl bg-[#008080] text-white hover:bg-[#006b6b]"
						onClick={goToBilling}
					>
						View plans
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="h-11 w-full rounded-xl text-[#525252]"
						onClick={() => onOpenChange(false)}
					>
						Not now
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
