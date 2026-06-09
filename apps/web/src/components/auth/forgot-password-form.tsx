import { useSignIn } from "@clerk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	combinedFieldErrors,
	fieldHasError,
	hasClerkFieldErrors,
} from "@legacy-building/ui/components/auth-field-error";
import { Button } from "@legacy-building/ui/components/button";
import {
	Field,
	FieldError,
	FieldLabel,
} from "@legacy-building/ui/components/field";
import { Input } from "@legacy-building/ui/components/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@legacy-building/ui/components/input-otp";
import {
	firstClerkErrorCode,
	firstClerkErrorMessage,
} from "@legacy-building/ui/lib/clerk-errors";
import { navigateAfterAuth } from "@legacy-building/ui/lib/navigation";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { PasswordInput } from "@/components/auth/password-input";
import {
	type ForgotPasswordCodeFormValues,
	type ForgotPasswordEmailFormValues,
	forgotPasswordCodeSchema,
	forgotPasswordEmailSchema,
	type NewPasswordFormValues,
	newPasswordSchema,
} from "@/lib/auth/schemas";
import { ROUTES } from "@/lib/routes";

const authFieldClass =
	"h-12 rounded-full border-border bg-popover px-5 text-base shadow-sm placeholder:text-muted-foreground md:text-sm";

const otpSlotClass =
	"size-11 rounded-md border-border bg-popover text-base shadow-sm first:rounded-l-md last:rounded-r-md md:size-12 md:text-lg";

type Props = {
	initialEmail?: string;
	onBack: () => void;
};

export function ForgotPasswordForm({ initialEmail = "", onBack }: Props) {
	const { signIn, errors, fetchStatus } = useSignIn();
	const navigate = useNavigate();

	const [codeSent, setCodeSent] = useState(false);

	const emailForm = useForm<ForgotPasswordEmailFormValues>({
		resolver: zodResolver(forgotPasswordEmailSchema),
		defaultValues: { email: initialEmail },
	});

	const codeForm = useForm<ForgotPasswordCodeFormValues>({
		resolver: zodResolver(forgotPasswordCodeSchema),
		defaultValues: { code: "" },
	});

	const passwordForm = useForm<NewPasswordFormValues>({
		resolver: zodResolver(newPasswordSchema),
		defaultValues: { password: "" },
	});

	const handleBack = async () => {
		await signIn?.reset();
		setCodeSent(false);
		codeForm.reset();
		passwordForm.reset();
		emailForm.clearErrors("root");
		codeForm.clearErrors("root");
		passwordForm.clearErrors("root");
		onBack();
	};

	const sendCode = emailForm.handleSubmit(async ({ email }) => {
		emailForm.clearErrors("root");
		if (!signIn) return;

		const { error: createError } = await signIn.create({
			identifier: email.trim(),
		});
		if (createError) {
			console.error(createError);
			return;
		}

		const { error: sendCodeError } =
			await signIn.resetPasswordEmailCode.sendCode();
		if (sendCodeError) {
			console.error(sendCodeError);
			return;
		}

		setCodeSent(true);
	});

	const verifyCode = codeForm.handleSubmit(async ({ code }) => {
		codeForm.clearErrors("root");
		if (!signIn) return;

		const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
		if (error) {
			console.error(error);
			return;
		}
	});

	const submitNewPassword = passwordForm.handleSubmit(async ({ password }) => {
		passwordForm.clearErrors("root");
		if (!signIn) return;

		const { error } = await signIn.resetPasswordEmailCode.submitPassword({
			password,
		});
		if (error) {
			console.error(error);
			const codeErr = firstClerkErrorCode(error);
			if (
				codeErr === "form_password_pwned" &&
				!errors.fields.password?.message
			) {
				passwordForm.setError("root", {
					message:
						"This password is known to be unsafe. Choose a different one.",
				});
			}
			return;
		}

		if (signIn.status === "complete") {
			const { error: finErr } = await signIn.finalize({
				navigate: async ({ session, decorateUrl }) => {
					if (session?.currentTask) return;
					navigateAfterAuth(navigate, decorateUrl(ROUTES.dashboard));
				},
			});
			if (finErr) {
				passwordForm.setError("root", {
					message:
						firstClerkErrorMessage(finErr) ?? "Could not finish sign-in.",
				});
			}
			return;
		}

		if (signIn.status === "needs_second_factor") {
			passwordForm.setError("root", {
				message:
					"Your account requires an extra sign-in step. Complete 2FA in the Clerk account portal or contact support.",
			});
			return;
		}

		passwordForm.setError("root", {
			message: "Password reset could not be completed. Try again.",
		});
		console.error("Sign-in not complete after reset:", signIn.status);
	});

	const emailRootError = emailForm.formState.errors.root;
	const codeRootError = codeForm.formState.errors.root;
	const passwordRootError = passwordForm.formState.errors.root;

	const sendingCode =
		fetchStatus === "fetching" || emailForm.formState.isSubmitting;
	const verifyingCode =
		fetchStatus === "fetching" || codeForm.formState.isSubmitting;
	const settingPassword =
		fetchStatus === "fetching" || passwordForm.formState.isSubmitting;
	const codeValue = codeForm.watch("code");
	const isCodeComplete = codeValue.length === 6;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="font-heading font-semibold text-2xl tracking-tight">
						Reset password
					</h2>
					<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
						We&apos;ll email you a code. Then choose a new password.
					</p>
				</div>
			</div>

			{!codeSent ? (
				<form onSubmit={sendCode} className="flex flex-col gap-4" noValidate>
					<Controller
						name="email"
						control={emailForm.control}
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
					{emailRootError && !hasClerkFieldErrors(errors.fields) ? (
						<FieldError errors={[emailRootError]} />
					) : null}
					<Button
						type="submit"
						variant="default"
						disabled={sendingCode}
						className="h-12 w-full gap-2 rounded-full font-semibold text-base"
					>
						{sendingCode ? (
							<>
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Sending…
							</>
						) : (
							"Send reset code"
						)}
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="h-11 w-full rounded-full text-muted-foreground text-sm hover:text-foreground"
						onClick={() => void handleBack()}
					>
						Back to sign in
					</Button>
				</form>
			) : null}

			{codeSent && signIn?.status !== "needs_new_password" ? (
				<form onSubmit={verifyCode} className="flex flex-col gap-4" noValidate>
					<Controller
						name="code"
						control={codeForm.control}
						render={({ field, fieldState }) => {
							const clerkMessage = errors.fields.code?.message;
							const invalid = fieldHasError(fieldState.invalid, clerkMessage);
							return (
								<Field data-invalid={invalid}>
									<FieldLabel htmlFor={field.name} className="sr-only">
										Reset code
									</FieldLabel>
									<InputOTP
										id={field.name}
										maxLength={6}
										pattern="^[0-9]+$"
										autoComplete="one-time-code"
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										aria-invalid={invalid}
										containerClassName="justify-center"
									>
										<InputOTPGroup aria-invalid={invalid}>
											<InputOTPSlot index={0} className={otpSlotClass} />
											<InputOTPSlot index={1} className={otpSlotClass} />
											<InputOTPSlot index={2} className={otpSlotClass} />
											<InputOTPSlot index={3} className={otpSlotClass} />
											<InputOTPSlot index={4} className={otpSlotClass} />
											<InputOTPSlot index={5} className={otpSlotClass} />
										</InputOTPGroup>
									</InputOTP>
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
					{codeRootError && !hasClerkFieldErrors(errors.fields) ? (
						<FieldError errors={[codeRootError]} />
					) : null}
					<Button
						type="submit"
						variant={isCodeComplete || verifyingCode ? "default" : "secondary"}
						disabled={!isCodeComplete || verifyingCode}
						className="h-12 w-full gap-2 rounded-full font-semibold text-base disabled:opacity-100"
					>
						{verifyingCode ? (
							<>
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Verifying…
							</>
						) : isCodeComplete ? (
							"Verify code"
						) : (
							"Enter code"
						)}
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="h-11 w-full rounded-full text-muted-foreground text-sm hover:text-foreground"
						onClick={() => void handleBack()}
					>
						Back to sign in
					</Button>
				</form>
			) : null}

			{signIn?.status === "needs_new_password" ? (
				<form
					onSubmit={submitNewPassword}
					className="flex flex-col gap-4"
					noValidate
				>
					<Controller
						name="password"
						control={passwordForm.control}
						render={({ field, fieldState }) => {
							const clerkMessage = errors.fields.password?.message;
							const invalid = fieldHasError(fieldState.invalid, clerkMessage);
							return (
								<Field data-invalid={invalid}>
									<FieldLabel htmlFor={field.name} className="sr-only">
										New password
									</FieldLabel>
									<PasswordInput
										{...field}
										id={field.name}
										autoComplete="new-password"
										placeholder="New password"
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
					{passwordRootError && !hasClerkFieldErrors(errors.fields) ? (
						<FieldError errors={[passwordRootError]} />
					) : null}
					<Button
						type="submit"
						variant="default"
						disabled={settingPassword}
						className="h-12 w-full gap-2 rounded-full font-semibold text-base"
					>
						{settingPassword ? (
							<>
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Setting password…
							</>
						) : (
							"Set new password"
						)}
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="h-11 w-full rounded-full text-muted-foreground text-sm hover:text-foreground"
						onClick={() => void handleBack()}
					>
						Back to sign in
					</Button>
				</form>
			) : null}

			{signIn?.status === "needs_second_factor" ? (
				<p className="text-muted-foreground text-sm">
					Additional verification is required for this account. Use another
					sign-in method or contact support.
				</p>
			) : null}
		</div>
	);
}
