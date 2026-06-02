import { useSignUp } from "@clerk/react";
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
import { firstClerkErrorMessage } from "@mobile-starter/ui/lib/clerk-errors";
import { navigateAfterAuth } from "@mobile-starter/ui/lib/navigation";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { type SignUpFormValues, signUpSchema } from "@/lib/auth/schemas";
import { splitFullName } from "@/lib/auth/signup-metadata";
import { ROUTES } from "@/lib/routes";

const authFieldClass =
	"h-12 rounded-full border-border bg-popover px-5 text-base shadow-sm placeholder:text-muted-foreground md:text-sm";

type Props = {
	unsafeMetadata?: Record<string, unknown>;
};

export function SignUpForm({ unsafeMetadata }: Props) {
	const { signUp, errors, fetchStatus } = useSignUp();
	const navigate = useNavigate();

	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: { fullName: "", email: "", password: "" },
	});

	const finalizeSignUp = async () => {
		if (!signUp) return;
		const { error } = await signUp.finalize({
			navigate: async ({ session, decorateUrl }) => {
				if (session?.currentTask) return;
				navigateAfterAuth(navigate, decorateUrl(ROUTES.dashboard));
			},
		});
		if (error) {
			console.error(error);
		}
	};

	const onSubmit = form.handleSubmit(async ({ fullName, email, password }) => {
		form.clearErrors("root");
		if (!signUp) return;

		const { firstName, lastName } = splitFullName(fullName);

		const { error: signUpError } = await signUp.password({
			emailAddress: email.trim(),
			password,
			firstName,
			lastName,
			unsafeMetadata,
		});

		if (signUpError) {
			console.error(signUpError);
			return;
		}

		const { error: sendError } = await signUp.verifications.sendEmailCode();
		if (sendError) {
			form.setError("root", {
				message:
					firstClerkErrorMessage(sendError) ??
					"Could not send verification email.",
			});
			return;
		}

		if (
			signUp.status === "missing_requirements" &&
			signUp.unverifiedFields.includes("email_address") &&
			signUp.missingFields.length === 0
		) {
			navigate({ to: ROUTES.verifyEmail });
			return;
		}

		if (signUp.status === "complete") {
			await finalizeSignUp();
			return;
		}

		navigate({ to: ROUTES.verifyEmail });
	});

	const rootError = form.formState.errors.root;

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
			<Controller
				name="fullName"
				control={form.control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor={field.name} className="sr-only">
							Full name
						</FieldLabel>
						<Input
							{...field}
							id={field.name}
							type="text"
							autoComplete="name"
							placeholder="Full name"
							className={authFieldClass}
							aria-invalid={fieldState.invalid}
						/>
						{fieldState.invalid ? (
							<FieldError errors={[fieldState.error]} />
						) : null}
					</Field>
				)}
			/>
			<Controller
				name="email"
				control={form.control}
				render={({ field, fieldState }) => {
					const clerkMessage = errors.fields.emailAddress?.message;
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
				control={form.control}
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
								autoComplete="new-password"
								placeholder="Password (6+ characters)"
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
			{rootError && !hasClerkFieldErrors(errors.fields) ? (
				<FieldError errors={[rootError]} />
			) : null}
			<Button
				type="submit"
				variant="default"
				disabled={fetchStatus === "fetching" || form.formState.isSubmitting}
				className="mt-1 h-12 w-full rounded-full font-semibold text-base"
			>
				Create account
			</Button>
			<div id="clerk-captcha" />
		</form>
	);
}
