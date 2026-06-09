import { cn } from "@legacy-building/ui/lib/utils";
import { Check, Copy, Mail, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogTitle } from "@/components/journal/ui/dialog";
import { DialogContentWithOverlay } from "@/components/journal/ui/dialog-content-with-overlay";

const SUPPORT_EMAIL = "dev@leagacyjournalbuilding.com";

const modalIconButtonClass =
	"inline-flex items-center justify-center rounded-lg text-muted-foreground transition-[color,background-color,transform] hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2";

type ContactSupportModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ContactSupportModal({
	open,
	onOpenChange,
}: ContactSupportModalProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(SUPPORT_EMAIL);
			setCopied(true);
			toast.success("Email copied to clipboard.");
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Could not copy email. Please copy it manually.");
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setCopied(false);
				onOpenChange(next);
			}}
		>
			<DialogContentWithOverlay
				showCloseButton={false}
				overlayClassName="bg-foreground/60 duration-300 ease-out"
				className={cn(
					"z-[2002] w-[calc(100%-2rem)] max-w-[440px] gap-0 overflow-hidden rounded-2xl",
					"border border-border bg-popover p-0 text-popover-foreground shadow-xl",
					"duration-300 ease-out sm:max-w-[440px]",
				)}
			>
				<div className="p-6 sm:p-7">
					<div className="mb-5 flex items-start justify-between gap-3">
						<div className="flex items-start gap-3">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
								<Mail className="size-5 text-primary" strokeWidth={2} />
							</div>
							<div className="min-w-0 pt-0.5">
								<DialogTitle className="font-semibold text-foreground text-xl leading-tight">
									Contact Support
								</DialogTitle>
								<p className="mt-1 text-muted-foreground text-sm">
									We&apos;re here to help with billing and account questions.
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className={cn(modalIconButtonClass, "size-9 shrink-0")}
							aria-label="Close"
						>
							<X className="size-5" strokeWidth={2} />
						</button>
					</div>

					<p className="mb-4 text-foreground text-sm leading-relaxed">
						Please reach out to us at the email below and we&apos;ll get back to
						you as soon as possible.
					</p>

					<div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2 pl-4">
						<a
							href={`mailto:${SUPPORT_EMAIL}`}
							className="min-w-0 flex-1 truncate font-medium text-foreground text-sm hover:underline"
						>
							{SUPPORT_EMAIL}
						</a>
						<button
							type="button"
							onClick={() => void handleCopy()}
							className={cn(
								"inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3",
								"font-medium text-foreground text-sm transition-[color,background-color]",
								"hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
							)}
						>
							{copied ? (
								<Check className="size-4 text-primary" aria-hidden />
							) : (
								<Copy className="size-4" aria-hidden />
							)}
							{copied ? "Copied" : "Copy"}
						</button>
					</div>
				</div>
			</DialogContentWithOverlay>
		</Dialog>
	);
}
