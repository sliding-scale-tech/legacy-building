import { useSignIn } from "@clerk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	combinedFieldErrors,
	fieldHasError,
	hasClerkFieldErrors,
} from "@mobile-starter/ui/components/auth-field-error";
import { Button } from "@mobile-starter/ui/components/button";
import {
	Field,
	FieldError,
	FieldLabel,
} from "@mobile-starter/ui/components/field";
import { Input } from "@mobile-starter/ui/components/input";
import {
	firstClerkErrorCode,
	firstClerkErrorMessage,
} from "@mobile-starter/ui/lib/clerk-errors";
import { navigateAfterAuth } from "@mobile-starter/ui/lib/navigation";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import {
	type SignInFormValues,
	type SignInMfaCodeFormValues,
	signInMfaCodeSchema,
	signInSchema,
} from "@/lib/auth/schemas";
import { ROUTES } from "@/lib/routes";

const authFieldClass =
	"h-12 rounded-full border-border bg-popover px-5 text-base shadow-sm placeholder:text-muted-foreground md:text-sm";

type Props = {
	signUpHref: string;
	forgotOpen: boolean;
	setForgotOpen: (open: boolean) => void;
};

export function SignInForm({ signUpHref, forgotOpen, setForgotOpen }: Props) {
	const { signIn, errors, fetchStatus } = useSignIn();
	const navigate = useNavigate();

	const [needsClientTrustCode, setNeedsClientTrustCode] = useState(false);
	const [showNoAccountHint, setShowNoAccountHint] = useState(false);

	const credentialsForm = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: "", password: "" },
	});

	const mfaForm = useForm<SignInMfaCodeFormValues>({
		resolver: zodResolver(signInMfaCodeSchema),
		defaultValues: { code: "" },
	});

	const resetFlow = async () => {
		await signIn?.reset();
		setNeedsClientTrustCode(false);
		mfaForm.reset();
		credentialsForm.clearErrors("root");
		setShowNoAccountHint(false);
	};

	const finalizeSignIn = async () => {
		if (!signIn) return;
		const { error } = await signIn.finalize({
			navigate: async ({ session, decorateUrl }) => {
				if (session?.currentTask) return;
				navigateAfterAuth(navigate, decorateUrl(ROUTES.dashboard));
			},
		});
		if (error) {
			console.error(error);
		}
	};

	const onCredentialsSubmit = credentialsForm.handleSubmit(
		async ({ email, password }) => {
			credentialsForm.clearErrors("root");
			setShowNoAccountHint(false);

			if (!signIn) return;

			const { error: signInError } = await signIn.password({
				emailAddress: email.trim(),
				password,
			});

			if (signInError) {
				console.error(signInError);
				if (firstClerkErrorCode(signInError) === "form_identifier_not_found") {
					setShowNoAccountHint(true);
					return;
				}
				return;
			}

			if (signIn.status === "complete") {
				await finalizeSignIn();
				return;
			}

			if (signIn.status === "needs_second_factor") {
				credentialsForm.setError("root", {
					message:
						"Additional verification is required. Use another sign-in method or contact support.",
				});
				return;
			}

			if (signIn.status === "needs_client_trust") {
				const emailCodeFactor = signIn.supportedSecondFactors.find(
					(factor) => factor.strategy === "email_code",
				);
				if (emailCodeFactor) {
					const { error: mfaErr } = await signIn.mfa.sendEmailCode();
					if (mfaErr) {
						credentialsForm.setError("root", {
							message:
								firstClerkErrorMessage(mfaErr) ??
								"Could not send verification code.",
						});
						return;
					}
					setNeedsClientTrustCode(true);
					return;
				}
				credentialsForm.setError("root", {
					message: "Additional verification is required.",
				});
				return;
			}

			credentialsForm.setError("root", {
				message: "Sign-in could not be completed. Try again.",
			});
			console.error("Sign-in attempt not complete:", signIn.status);
		},
	);

	const onMfaSubmit = mfaForm.handleSubmit(async ({ code }) => {
		mfaForm.clearErrors("root");
		if (!signIn) return;

		const { error } = await signIn.mfa.verifyEmailCode({ code });
		if (error) {
			console.error(error);
			return;
		}

		if (signIn.status === "complete") {
			await finalizeSignIn();
		} else {
			console.error("Sign-in attempt not complete. Status:", signIn.status);
			mfaForm.setError("root", { message: "Sign-in incomplete." });
		}
	});

	const openForgot = async () => {
		credentialsForm.clearErrors("root");
		setShowNoAccountHint(false);
		await signIn?.reset();
		setForgotOpen(true);
	};

	if (forgotOpen) {
		return (
			<ForgotPasswordForm
				initialEmail={credentialsForm.getValues("email")}
				onBack={() => {
					void signIn?.reset();
					setForgotOpen(false);
				}}
			/>
		);
	}

	if (needsClientTrustCode) {
		const mfaRootError = mfaForm.formState.errors.root;
		return (
			<div className="flex flex-col gap-5">
				<div>
					<h2 className="font-heading font-semibold text-2xl tracking-tight">
						Confirm it&apos;s you
					</h2>
					<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
						Enter the code we sent to your email to finish signing in.
					</p>
				</div>
				<form onSubmit={onMfaSubmit} className="flex flex-col gap-4" noValidate>
					<Controller
						name="code"
						control={mfaForm.control}
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
										className={authFieldClass}
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
					{mfaRootError && !hasClerkFieldErrors(errors.fields) ? (
						<FieldError errors={[mfaRootError]} />
					) : null}
					<Button
						type="submit"
						variant="default"
						disabled={
							fetchStatus === "fetching" || mfaForm.formState.isSubmitting
						}
						className="h-12 w-full rounded-full font-semibold text-base"
					>
						Verify
					</Button>
				</form>
				<div className="flex flex-wrap gap-4 text-sm">
					<Button
						type="button"
						variant="link"
						className="h-auto p-0 font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
						onClick={() => void signIn?.mfa.sendEmailCode()}
					>
						Resend code
					</Button>
					<Button
						type="button"
						variant="link"
						className="h-auto p-0 text-muted-foreground no-underline hover:text-foreground"
						onClick={() => void resetFlow()}
					>
						Start over
					</Button>
				</div>
			</div>
		);
	}

	const credentialsRootError = credentialsForm.formState.errors.root;

	return (
		<form
			onSubmit={onCredentialsSubmit}
			className="flex flex-col gap-4"
			noValidate
		>
			<Controller
				name="email"
				control={credentialsForm.control}
				render={({ field, fieldState }) => {
					const clerkMessage = errors.fields.identifier?.message;
					const invalid = fieldHasError(fieldState.invalid, clerkMessage);
					return (
						<Field data-invalid={invalid}>
							<FieldLabel htmlFor={field.name} className="sr-only">
								Email
							</FieldLabel>
							<Input
								{...field}
								id={field.name}
								type="email"
								autoComplete="email"
								placeholder="Email"
								className={authFieldClass}
								aria-invalid={invalid}
							/>
							{invalid ? (
								<FieldError
									errors={combinedFieldErrors(fieldState.error, clerkMessage)}
								/>
							) : null}
						</Field>
					);
				}}
			/>
			<Controller
				name="password"
				control={credentialsForm.control}
				render={({ field, fieldState }) => {
					const clerkMessage = errors.fields.password?.message;
					const invalid = fieldHasError(fieldState.invalid, clerkMessage);
					return (
						<Field data-invalid={invalid}>
							<FieldLabel htmlFor={field.name} className="sr-only">
								Password
							</FieldLabel>
							<Input
								{...field}
								id={field.name}
								type="password"
								autoComplete="current-password"
								placeholder="Password"
								className={authFieldClass}
								aria-invalid={invalid}
							/>
							{invalid ? (
								<FieldError
									errors={combinedFieldErrors(fieldState.error, clerkMessage)}
								/>
							) : null}
							<div className="flex flex-row items-center justify-between gap-3 pt-0.5">
								<Button
									type="button"
									variant="link"
									className="h-auto p-0 font-medium text-foreground text-sm underline underline-offset-4 hover:text-foreground/80"
									onClick={() => void openForgot()}
								>
									Forgot password?
								</Button>
								<Link
									to={signUpHref}
									className="shrink-0 font-semibold text-foreground text-sm underline underline-offset-4 hover:text-foreground/80"
								>
									Create account
								</Link>
							</div>
						</Field>
					);
				}}
			/>
			{showNoAccountHint ? (
				<p className="text-muted-foreground text-sm">
					No account found for this email.{" "}
					<Link
						to={signUpHref}
						className="font-semibold text-foreground underline underline-offset-4"
					>
						Sign up
					</Link>{" "}
					to create one.
				</p>
			) : null}
			{credentialsRootError && !hasClerkFieldErrors(errors.fields) ? (
				<FieldError errors={[credentialsRootError]} />
			) : null}
			<Button
				type="submit"
				variant="default"
				disabled={
					fetchStatus === "fetching" || credentialsForm.formState.isSubmitting
				}
				className="mt-1 h-12 w-full rounded-full font-semibold text-base"
			>
				Sign in
			</Button>
		</form>
	);
}
