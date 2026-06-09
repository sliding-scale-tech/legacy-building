import { cn } from "@legacy-building/ui/lib/utils";
import { Loader2, X } from "lucide-react";

import { Dialog, DialogTitle } from "@/components/journal/ui/dialog";
import { DialogContentWithOverlay } from "@/components/journal/ui/dialog-content-with-overlay";

type CancelSubscriptionModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	planSummary: string;
	periodEndDate: string;
	onConfirm: () => void | Promise<void>;
	pending?: boolean;
};

const modalButtonClass =
	"inline-flex h-11 flex-1 items-center justify-center rounded-xl border font-medium text-sm transition-[color,background-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function CancelSubscriptionModal({
	open,
	onOpenChange,
	planSummary,
	periodEndDate,
	onConfirm,
	pending = false,
}: CancelSubscriptionModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContentWithOverlay
				showCloseButton={false}
				overlayClassName="bg-foreground/60 duration-300 ease-out"
				className={cn(
					"z-[2002] w-[calc(100%-2rem)] max-w-[480px] gap-0 overflow-hidden rounded-2xl",
					"border border-border bg-popover p-0 text-popover-foreground shadow-xl",
					"duration-300 ease-out sm:max-w-[480px]",
				)}
			>
				<div className="p-6 sm:p-7">
					<div className="mb-6 flex items-start gap-3">
						<div
							className="flex size-10 shrink-0 items-center justify-center rounded-full"
							style={{ backgroundColor: "#fff4e6" }}
							aria-hidden
						>
							<X className="size-5 text-[#e07a2f]" strokeWidth={2} />
						</div>
						<div className="min-w-0 pt-0.5">
							<DialogTitle className="font-semibold text-foreground text-xl leading-tight">
								Cancel Subscription?
							</DialogTitle>
							<p className="mt-1 text-muted-foreground text-sm">
								{planSummary}
							</p>
						</div>
					</div>

					<div className="mb-8 space-y-2 text-center text-foreground text-sm leading-relaxed">
						<p>
							Your subscription will remain active until{" "}
							<strong className="font-semibold">{periodEndDate}</strong>.
						</p>
						<p>After that, your account will revert to the free plan.</p>
					</div>

					<div className="flex flex-col-reverse gap-3 sm:flex-row">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							disabled={pending}
							className={cn(
								modalButtonClass,
								"border-border bg-card text-foreground hover:bg-muted",
							)}
						>
							Keep Subscription
						</button>
						<button
							type="button"
							onClick={() => void onConfirm()}
							disabled={pending}
							className={cn(
								modalButtonClass,
								"border-red-100 bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-200",
							)}
						>
							{pending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : (
								"Yes, Cancel"
							)}
						</button>
					</div>
				</div>
			</DialogContentWithOverlay>
		</Dialog>
	);
}
