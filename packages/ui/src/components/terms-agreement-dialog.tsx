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
import {
	TERMS_CHECKBOX_LABEL,
	TERMS_DESCRIPTION,
	TERMS_PARAGRAPHS,
	TERMS_TITLE,
} from "@legacy-building/ui/lib/terms";
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
				className="w-[calc(100vw-2rem)] max-w-2xl overflow-hidden p-0"
			>
				<div className="flex items-center gap-2 border-border border-b bg-muted/40 px-6 py-5">
					<FileText className="size-4 text-primary" aria-hidden />
					<div>
						<DialogTitle className="text-lg">{TERMS_TITLE}</DialogTitle>
						<DialogDescription className="mt-0.5">
							{TERMS_DESCRIPTION}
						</DialogDescription>
					</div>
				</div>

				<div className="max-h-[55svh] space-y-3 overflow-y-auto px-6 py-5 text-muted-foreground text-sm leading-relaxed">
					{TERMS_PARAGRAPHS.map((paragraph) => (
						<p key={paragraph.slice(0, 24)}>{paragraph}</p>
					))}
				</div>

				<div className="space-y-4 border-border border-t bg-muted/30 px-6 py-4">
					<div className="flex items-start gap-2.5">
						<Checkbox
							id="agree-terms"
							checked={agreed}
							onCheckedChange={(checked) => setAgreed(checked === true)}
							disabled={submitting}
							className="mt-0.5"
						/>
						<Label
							htmlFor="agree-terms"
							className="cursor-pointer select-none font-normal text-foreground text-sm leading-snug"
						>
							{TERMS_CHECKBOX_LABEL}
						</Label>
					</div>

					<Button
						type="button"
						onClick={handleAgree}
						disabled={!agreed || submitting}
						className="w-full transition-transform active:scale-[0.98]"
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
