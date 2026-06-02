import { useSignUp } from "@clerk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	combinedFieldErrors,
	fieldHasError,
} from "@legacy-building/ui/components/auth-field-error";
import { Button, buttonVariants } from "@legacy-building/ui/components/button";
import {
	Field,
	FieldError,
	FieldLabel,
} from "@legacy-building/ui/components/field";
import { Input } from "@legacy-building/ui/components/input";
import { APP_NAME } from "@legacy-building/ui/lib/brand";
import { firstClerkErrorMessage } from "@legacy-building/ui/lib/clerk-errors";
import { navigateAfterAuth } from "@legacy-building/ui/lib/navigation";
import { cn } from "@legacy-building/ui/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	createLoginContinueSchema,
	type LoginContinueFormValues,
} from "@/lib/auth/schemas";
import { splitFullName } from "@/lib/auth/signup-metadata";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/login/continue")({
	component: LoginContinuePage,
});

function LoginContinuePage() {
	const { signUp, errors, fetchStatus } = useSignUp();

	if (!signUp) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center gap-4">
				<div
					className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
					aria-hidden
				/>
				<p className="text-muted-foreground text-sm">Loading…</p>
			</div>
		);
	}

	return (
		<LoginContinueForm
			signUp={signUp}
			errors={errors}
			fetchStatus={fetchStatus}
		/>
	);
}

type LoginContinueFormProps = {
	signUp: NonNullable<ReturnType<typeof useSignUp>["signUp"]>;
	errors: ReturnType<typeof useSignUp>["errors"];
	fetchStatus: ReturnType<typeof useSignUp>["fetchStatus"];
};

function LoginContinueForm({
	signUp,
	errors,
	fetchStatus,
}: LoginContinueFormProps) {
	const navigate = useNavigate();

	const needsUsername = signUp.missingFields.includes("username");
	const needsFirstName = signUp.missingFields.includes("first_name");
	const needsLastName = signUp.missingFields.includes("last_name");
	const needsName = needsFirstName || needsLastName;

	const schema = useMemo(
		() => createLoginContinueSchema({ needsUsername, needsName }),
		[needsUsername, needsName],
	);

	const form = useForm<LoginContinueFormValues>({
		resolver: zodResolver(schema),
		defaultValues: { username: "", fullName: "" },
	});

	const onSubmit = form.handleSubmit(async (values) => {
		form.clearErrors("root");
		if (!signUp) return;

		const payload: {
			username?: string;
			firstName?: string;
			lastName?: string;
		} = {};

		if (needsUsername && values.username) {
			payload.username = values.username.trim();
		}

		if (needsName && values.fullName) {
			const { firstName, lastName } = splitFullName(values.fullName);
			if (needsFirstName) payload.firstName = firstName;
			if (needsLastName) payload.lastName = lastName;
		}

		const { error } = await signUp.update(payload);
		if (error) {
			form.setError("root", {
				message:
					firstClerkErrorMessage(error) ?? "Could not save your details.",
			});
			return;
		}

		if (signUp.status === "complete") {
			const { error: finErr } = await signUp.finalize({
				navigate: async ({ session, decorateUrl }) => {
					if (session?.currentTask) return;
					navigateAfterAuth(navigate, decorateUrl(ROUTES.dashboard));
				},
			});
			if (finErr) {
				form.setError("root", {
					message:
						firstClerkErrorMessage(finErr) ?? "Could not finish sign-up.",
				});
			}
			return;
		}

		if (signUp.status === "missing_requirements") {
			form.setError("root", {
				message:
					"More information is still required. Check your Clerk settings.",
			});
			return;
		}

		form.setError("root", {
			message: "Sign-up could not be completed. Try again.",
		});
	});

	const rootError = form.formState.errors.root;
	const authFieldClass =
		"h-12 rounded-full border-border bg-popover px-5 text-base shadow-sm placeholder:text-muted-foreground md:text-sm";

	return (
		<div className="relative flex min-h-svh flex-col bg-background text-foreground">
			<div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
				<div className="w-full max-w-md">
					<header className="mb-8 flex shrink-0 items-center gap-3">
						<Link
							to={ROUTES.login}
							aria-label="Back to sign in"
							className={cn(
								buttonVariants({ variant: "outline", size: "icon" }),
								"size-10 rounded-full border-border bg-popover shadow-sm",
							)}
						>
							<ChevronLeft
								className="size-5 text-foreground"
								strokeWidth={1.75}
							/>
						</Link>
						<span className="font-heading font-semibold text-foreground text-lg tracking-tight">
							{APP_NAME}
						</span>
					</header>

					<main className="flex w-full flex-col gap-6">
						<div>
							<h1 className="font-heading font-semibold text-3xl tracking-tight">
								Almost there
							</h1>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								Add the details below to finish creating your account.
							</p>
						</div>

						<form
							onSubmit={onSubmit}
							className="flex flex-col gap-4"
							noValidate
						>
							{needsUsername ? (
								<Controller
									name="username"
									control={form.control}
									render={({ field, fieldState }) => {
										const clerkMessage = errors.fields.username?.message;
										const invalid = fieldHasError(
											fieldState.invalid,
											clerkMessage,
										);
										return (
											<Field data-invalid={invalid}>
												<FieldLabel htmlFor={field.name} className="sr-only">
													Username
												</FieldLabel>
												<Input
													{...field}
													id={field.name}
													type="text"
													autoComplete="username"
													placeholder="Username"
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
							) : null}

							{needsName ? (
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
							) : null}

							{rootError ? <FieldError errors={[rootError]} /> : null}

							<Button
								type="submit"
								variant="default"
								disabled={
									fetchStatus === "fetching" || form.formState.isSubmitting
								}
								className="h-12 w-full rounded-full font-semibold text-base"
							>
								Continue
							</Button>
						</form>
					</main>
				</div>
			</div>
		</div>
	);
}
