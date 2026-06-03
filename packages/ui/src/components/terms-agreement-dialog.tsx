"use client";

import { api } from "@legacy-building/backend/convex/_generated/api";
import { Button } from "@legacy-building/ui/components/button";
import { Checkbox } from "@legacy-building/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@legacy-building/ui/components/dialog";
import { Label } from "@legacy-building/ui/components/label";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { legalRoutes } from "@legacy-building/ui/lib/brand-journal";
import {
	TERMS_DESCRIPTION,
	TERMS_PARAGRAPHS,
	TERMS_TITLE,
} from "@legacy-building/ui/lib/terms";
import { cn } from "@legacy-building/ui/lib/utils";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function TermsAgreementDialog() {
	const { convexUser, isSignedIn, isLoading } = useCurrentUser();
	const agreeToTerms = useMutation(api.user.mutations.agreeToTerms);

	const [agreed, setAgreed] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const needsAgreement =
		!isLoading &&
		isSignedIn &&
		convexUser !== null &&
		convexUser !== undefined &&
		!convexUser.agreedToTermsAt;

	if (!needsAgreement) return null;

	const handleAgree = async () => {
		if (!agreed || submitting) return;
		setSubmitting(true);
		try {
			await agreeToTerms({});
			toast.success("Welcome aboard.");
		} catch (err) {
			const msg =
				err instanceof ConvexError &&
				typeof err.data === "object" &&
				err.data !== null &&
				"message" in err.data
					? String((err.data as { message: string }).message)
					: "Could not save. Try again.";
			toast.error(msg);
			setSubmitting(false);
		}
	};

	return (
		<Dialog
			open
			onOpenChange={() => {
				/* intentionally ignored */
			}}
		>
			<DialogContent
				showCloseButton={false}
				overlayClassName="z-[1990] bg-[rgba(82,82,82,0.6)] supports-backdrop-filter:backdrop-blur-[2px]"
				className={cn(
					"z-[2000] w-[calc(100vw-2rem)] max-w-2xl gap-0 overflow-hidden rounded-2xl border border-[#e6e6e6] bg-white p-0 text-[#1a1a1a] shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-0 sm:max-w-2xl",
				)}
			>
				<div className="flex items-center gap-3 border-[#e6e6e6] border-b bg-[#ebf6f6] px-6 py-5">
					<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#008080]/10">
						<FileText className="size-4 text-[#008080]" aria-hidden />
					</div>
					<div>
						<DialogTitle className="font-semibold text-[#1a1a1a] text-lg">
							{TERMS_TITLE}
						</DialogTitle>
						<DialogDescription className="mt-0.5 text-[#525252] text-sm">
							{TERMS_DESCRIPTION}
						</DialogDescription>
					</div>
				</div>

				<div className="max-h-[min(55svh,420px)] space-y-3 overflow-y-auto px-6 py-5 text-[#525252] text-sm leading-relaxed">
					{TERMS_PARAGRAPHS.map((paragraph) => (
						<p key={paragraph.slice(0, 24)}>{paragraph}</p>
					))}
				</div>

				<div className="space-y-4 border-[#e6e6e6] border-t bg-[#f7f7f7] px-6 py-4">
					<div className="flex items-start gap-2.5">
						<Checkbox
							id="agree-terms"
							checked={agreed}
							onCheckedChange={(checked) => setAgreed(checked === true)}
							disabled={submitting}
							className="mt-0.5 border-[#c7c7c7] data-checked:border-[#008080] data-checked:bg-[#008080]"
						/>
						<Label
							htmlFor="agree-terms"
							className="cursor-pointer select-none font-normal text-[#1a1a1a] text-sm leading-snug"
						>
							I have read and agree to the{" "}
							<a
								href={legalRoutes.terms}
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-[#008080] underline underline-offset-2"
								onClick={(e) => e.stopPropagation()}
							>
								Terms and Conditions
							</a>{" "}
							and{" "}
							<a
								href={legalRoutes.privacy}
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-[#008080] underline underline-offset-2"
								onClick={(e) => e.stopPropagation()}
							>
								Privacy Policy
							</a>
							.
						</Label>
					</div>

					<Button
						type="button"
						onClick={handleAgree}
						disabled={!agreed || submitting}
						className="h-11 w-full rounded-xl bg-[#008080] font-medium text-base text-white hover:bg-[#006b6b] disabled:opacity-50"
					>
						{submitting ? (
							<>
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Saving…
							</>
						) : (
							"Continue"
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default TermsAgreementDialog;
