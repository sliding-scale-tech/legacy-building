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
import { Loader2 } from "lucide-react";
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

type PasswordFormValues = z.infer<typeof passwordSchema>;

const lightInputClassName =
	"rounded-xl border border-[#e6e6e6] bg-white text-[#1a1a1a] shadow-none placeholder:text-[#a3a3a3] focus-visible:border-[#008080] focus-visible:ring-[#008080]/25";

const lightLabelClassName = "text-[#1a1a1a]";

type PasswordChangeFormProps = {
	/** Use on white dashboard cards where global dark theme hides inputs */
	appearance?: "default" | "light";
	/** Account page: tighter layout + site button radius */
	compact?: boolean;
	onSuccess?: () => void;
};

export function PasswordChangeForm({
	appearance = "default",
	compact = false,
	onSuccess,
}: PasswordChangeFormProps) {
	const { user, isLoaded } = useUser();

	const form = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
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
		compact && "h-11 rounded-[12px] border-[#c7c7c7]",
	);
	const labelClassName =
		appearance === "light" ? lightLabelClassName : undefined;
	const submitClassName = cn(
		appearance === "light"
			? "bg-[#008080] text-white hover:bg-[#006b6b]"
			: undefined,
		compact && "h-11 rounded-[12px] px-6 font-medium text-sm",
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
