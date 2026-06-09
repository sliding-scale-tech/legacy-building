"use client";

import { useUser } from "@clerk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@legacy-building/ui/components/button";
import {
	Field,
	FieldError,
	FieldLabel,
} from "@legacy-building/ui/components/field";
import { Input } from "@legacy-building/ui/components/input";
import { firstClerkErrorMessage } from "@legacy-building/ui/lib/clerk-errors";
import { cn } from "@legacy-building/ui/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, "Enter your current password."),
		newPassword: z.string().min(8, "Use at least 8 characters."),
		confirmPassword: z.string().min(1, "Confirm your new password."),
	})
	.refine((d) => d.newPassword === d.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords don't match.",
	});

const accountPasswordSchema = z.object({
	currentPassword: z.string().min(1, "Enter your current password."),
	newPassword: z.string().min(8, "Use at least 8 characters."),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type AccountPasswordFormValues = z.infer<typeof accountPasswordSchema>;

const lightInputClassName =
	"rounded-xl border border-[#e6e6e6] bg-white text-[#1a1a1a] shadow-none placeholder:text-[#a3a3a3] focus-visible:border-[#008080] focus-visible:ring-[#008080]/25";

const lightLabelClassName = "text-[#1a1a1a]";

type PasswordChangeFormProps = {
	/** Use on white dashboard cards where global dark theme hides inputs */
	appearance?: "default" | "light";
	/** Account page: tighter layout + site button radius */
	compact?: boolean;
	/** Account settings row layout with old/new fields and inline update button */
	layout?: "default" | "account";
	onSuccess?: () => void;
};

function PasswordInputWithToggle({
	className,
	...props
}: React.ComponentProps<typeof Input>) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			<Input
				{...props}
				type={visible ? "text" : "password"}
				className={cn("pr-11", className)}
			/>
			<button
				type="button"
				onClick={() => setVisible((value) => !value)}
				aria-label={visible ? "Hide password" : "Show password"}
				className="absolute top-1/2 right-3 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-[#a3a3a3] transition-colors hover:text-[#666]"
			>
				{visible ? (
					<EyeOff className="size-4" aria-hidden />
				) : (
					<Eye className="size-4" aria-hidden />
				)}
			</button>
		</div>
	);
}

export function PasswordChangeForm({
	appearance = "default",
	compact = false,
	layout = "default",
	onSuccess,
}: PasswordChangeFormProps) {
	const { user, isLoaded } = useUser();
	const isAccountLayout = layout === "account";

	const form = useForm<PasswordFormValues | AccountPasswordFormValues>({
		resolver: zodResolver(
			isAccountLayout ? accountPasswordSchema : passwordSchema,
		),
		defaultValues: isAccountLayout
			? {
					currentPassword: "",
					newPassword: "",
				}
			: {
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				},
	});

	if (!isLoaded) return null;

	if (!user?.passwordEnabled) {
		return null;
	}

	const inputClassName = cn(
		appearance === "light" ? lightInputClassName : undefined,
		(isAccountLayout || compact) && "h-11 rounded-xl border-[#e0e0e0]",
	);
	const labelClassName =
		appearance === "light" ? lightLabelClassName : undefined;
	const submitClassName = cn(
		appearance === "light" || isAccountLayout
			? "bg-[#69b1b1] text-white hover:bg-[#5da3a3]"
			: undefined,
		(isAccountLayout || compact) &&
			"h-11 shrink-0 rounded-xl px-6 font-semibold text-sm",
	);

	const onSubmit = form.handleSubmit(
		async ({ currentPassword, newPassword }) => {
			try {
				await user?.updatePassword({
					currentPassword,
					newPassword,
					signOutOfOtherSessions: true,
				});
				form.reset();
				toast.success("Password updated.");
				onSuccess?.();
			} catch (err) {
				const msg = firstClerkErrorMessage(err) ?? "Could not update password.";
				form.setError("root", { message: msg });
				toast.error(msg);
			}
		},
	);

	const isSubmitting = form.formState.isSubmitting;
	const rootError = form.formState.errors.root;
	const PasswordFieldInput = isAccountLayout ? PasswordInputWithToggle : Input;

	if (isAccountLayout) {
		return (
			<form
				onSubmit={onSubmit}
				className="fade-in-50 mt-3 flex animate-in flex-col gap-3 duration-200"
				noValidate
			>
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end">
					<Controller
						name="currentPassword"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field
								data-invalid={fieldState.invalid}
								className="min-w-0 flex-1"
							>
								<FieldLabel
									htmlFor={field.name}
									className={cn(labelClassName, "font-normal text-sm")}
								>
									Old Password
								</FieldLabel>
								<PasswordFieldInput
									{...field}
									id={field.name}
									autoComplete="current-password"
									disabled={isSubmitting}
									aria-invalid={fieldState.invalid}
									className={inputClassName}
								/>
								{fieldState.invalid ? (
									<FieldError errors={[fieldState.error]} />
								) : null}
							</Field>
						)}
					/>
					<Controller
						name="newPassword"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field
								data-invalid={fieldState.invalid}
								className="min-w-0 flex-1"
							>
								<FieldLabel
									htmlFor={field.name}
									className={cn(labelClassName, "font-normal text-sm")}
								>
									New Password
								</FieldLabel>
								<PasswordFieldInput
									{...field}
									id={field.name}
									autoComplete="new-password"
									disabled={isSubmitting}
									aria-invalid={fieldState.invalid}
									className={inputClassName}
								/>
								{fieldState.invalid ? (
									<FieldError errors={[fieldState.error]} />
								) : null}
							</Field>
						)}
					/>
					<Button
						type="submit"
						disabled={isSubmitting}
						className={cn(
							"w-full transition-transform active:scale-[0.98] lg:w-auto",
							submitClassName,
						)}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Updating…
							</>
						) : (
							"Update"
						)}
					</Button>
				</div>
				{rootError ? (
					<FieldError errors={[rootError]} className="text-sm" />
				) : null}
			</form>
		);
	}

	return (
		<form
			onSubmit={onSubmit}
			className="fade-in-50 flex animate-in flex-col gap-4 duration-200"
			noValidate
		>
			<Controller
				name="currentPassword"
				control={form.control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor={field.name} className={labelClassName}>
							Current password
						</FieldLabel>
						<Input
							{...field}
							id={field.name}
							type="password"
							autoComplete="current-password"
							disabled={isSubmitting}
							aria-invalid={fieldState.invalid}
							className={inputClassName}
						/>
						{fieldState.invalid ? (
							<FieldError errors={[fieldState.error]} />
						) : null}
					</Field>
				)}
			/>

			<div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
				<Controller
					name="newPassword"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name} className={labelClassName}>
								New password
							</FieldLabel>
							<Input
								{...field}
								id={field.name}
								type="password"
								autoComplete="new-password"
								disabled={isSubmitting}
								aria-invalid={fieldState.invalid}
								className={inputClassName}
							/>
							{fieldState.invalid ? (
								<FieldError errors={[fieldState.error]} />
							) : null}
						</Field>
					)}
				/>
				<Controller
					name="confirmPassword"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name} className={labelClassName}>
								Confirm new password
							</FieldLabel>
							<Input
								{...field}
								id={field.name}
								type="password"
								autoComplete="new-password"
								disabled={isSubmitting}
								aria-invalid={fieldState.invalid}
								className={inputClassName}
							/>
							{fieldState.invalid ? (
								<FieldError errors={[fieldState.error]} />
							) : null}
						</Field>
					)}
				/>
			</div>

			{rootError ? (
				<FieldError errors={[rootError]} className="text-sm" />
			) : null}

			<Button
				type="submit"
				disabled={isSubmitting}
				className={cn(
					"self-start transition-transform active:scale-[0.98]",
					submitClassName,
				)}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="size-4 animate-spin" aria-hidden />
						Updating…
					</>
				) : (
					"Update password"
				)}
			</Button>
		</form>
	);
}

export default PasswordChangeForm;
