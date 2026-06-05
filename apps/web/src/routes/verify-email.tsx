import { useSignUp } from "@clerk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	combinedFieldErrors,
	fieldHasError,
} from "@legacy-building/ui/components/auth-field-error";
import { Button } from "@legacy-building/ui/components/button";
import {
	Field,
	FieldError,
	FieldLabel,
} from "@legacy-building/ui/components/field";
import { Input } from "@legacy-building/ui/components/input";
import { PageLoader } from "@legacy-building/ui/components/page-loader";
import { firstClerkErrorMessage } from "@legacy-building/ui/lib/clerk-errors";
import {
	navigateAfterAuth,
	navigateTo,
} from "@legacy-building/ui/lib/navigation";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import {
	type EmailVerificationCodeFormValues,
	emailVerificationCodeSchema,
} from "@/lib/auth/schemas";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/verify-email")({
	component: VerifyEmailPage,
});

function VerifyEmailPage() {
	const { signUp, errors, fetchStatus } = useSignUp();
	const navigate = useNavigate();

	const form = useForm<EmailVerificationCodeFormValues>({
		resolver: zodResolver(emailVerificationCodeSchema),
		defaultValues: { code: "" },
	});

	const onVerify = form.handleSubmit(async ({ code }) => {
		form.clearErrors("root");
		if (!signUp) return;

		const { error } = await signUp.verifications.verifyEmailCode({ code });
		if (error) {
			form.setError("root", {
				message: firstClerkErrorMessage(error) ?? "Could not verify that code.",
			});
			return;
		}

		if (signUp.status === "complete") {
			const { error: finalizeError } = await signUp.finalize({
				navigate: async ({ session, decorateUrl }) => {
					if (session?.currentTask) return;
					navigateAfterAuth(navigate, decorateUrl(ROUTES.dashboard));
				},
			});

			if (finalizeError) {
				form.setError("root", {
					message:
						firstClerkErrorMessage(finalizeError) ??
						"Could not finish sign-up.",
				});
			}
			return;
		}

		if (signUp.status === "missing_requirements") {
			navigateTo(navigate, ROUTES.loginContinue);
			return;
		}

		form.setError("root", {
			message: "That code did not complete sign-up. Please try again.",
		});
	});

	const resendCode = async () => {
		form.clearErrors("root");
		if (!signUp) return;

		const { error } = await signUp.verifications.sendEmailCode();
		if (error) {
			form.setError("root", {
				message: firstClerkErrorMessage(error) ?? "Could not send a new code.",
			});
		}
	};

	if (!signUp) {
		return (
			<>
				<PageLoader message="Please wait while we prepare email verification." />
				<div className="fixed inset-x-0 bottom-10 z-[9999] flex justify-center px-4">
					<Link
						to={ROUTES.signup}
						search={{ type: undefined }}
						className="text-primary hover:underline"
					>
						Back to sign up
					</Link>
				</div>
			</>
		);
	}

	const rootError = form.formState.errors.root;

	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-background px-5 py-10 text-foreground sm:px-8">
			<main className="w-full max-w-md">
				<h1 className="font-heading font-semibold text-3xl tracking-tight">
					Verify your email
				</h1>
				<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
					Enter the one-time code we sent to your email.
				</p>

				<form
					onSubmit={onVerify}
					className="mt-8 flex flex-col gap-4"
					noValidate
				>
					<Controller
						name="code"
						control={form.control}
						render={({ field, fieldState }) => {
							const clerkMessage = errors.fields.code?.message;
							const invalid = fieldHasError(fieldState.invalid, clerkMessage);
							return (
								<Field data-invalid={invalid}>
									<FieldLabel htmlFor={field.name} className="sr-only">
										Verification code
									</FieldLabel>
									<Input
										{...field}
										id={field.name}
										type="text"
										inputMode="numeric"
										autoComplete="one-time-code"
										placeholder="Verification code"
										className="h-12 rounded-full border-border bg-popover px-5 text-base shadow-sm placeholder:text-muted-foreground md:text-sm"
										aria-invalid={invalid}
									/>
									{invalid ? (
										<FieldError
											errors={combinedFieldErrors(
												fieldState.error,
												clerkMessage,
											)}
										/>
									) : null}
								</Field>
							);
						}}
					/>

					{rootError ? <FieldError errors={[rootError]} /> : null}

					<Button
						type="submit"
						disabled={fetchStatus === "fetching" || form.formState.isSubmitting}
						className="h-12 w-full rounded-full font-semibold text-base"
					>
						{form.formState.isSubmitting ? "Verifying..." : "Verify"}
					</Button>
				</form>

				<div className="mt-5 flex flex-wrap gap-4 text-sm">
					<Button
						type="button"
						variant="link"
						className="h-auto p-0 font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
						onClick={() => void resendCode()}
					>
						Send a new code
					</Button>
					<Link
						to={ROUTES.signup}
						search={{ type: undefined }}
						className="text-muted-foreground hover:text-foreground"
					>
						Back to sign up
					</Link>
				</div>

				<div id="clerk-captcha" />
			</main>
		</div>
	);
}
