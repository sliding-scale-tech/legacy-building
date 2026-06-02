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

export function PasswordChangeForm() {
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
		return (
			<p className="text-muted-foreground text-sm">
				You signed in with a social provider, so password changes happen there.
			</p>
		);
	}

	const onSubmit = form.handleSubmit(
		async ({ currentPassword, newPassword }) => {
			try {
				await user!.updatePassword({
					currentPassword,
					newPassword,
					signOutOfOtherSessions: true,
				});
				form.reset();
				toast.success("Password updated.");
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
						<FieldLabel htmlFor={field.name}>Current password</FieldLabel>
						<Input
							{...field}
							id={field.name}
							type="password"
							autoComplete="current-password"
							disabled={isSubmitting}
							aria-invalid={fieldState.invalid}
						/>
						{fieldState.invalid ? (
							<FieldError errors={[fieldState.error]} />
						) : null}
					</Field>
				)}
			/>

			<div className="grid gap-4 sm:grid-cols-2">
				<Controller
					name="newPassword"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name}>New password</FieldLabel>
							<Input
								{...field}
								id={field.name}
								type="password"
								autoComplete="new-password"
								disabled={isSubmitting}
								aria-invalid={fieldState.invalid}
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
							<FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
							<Input
								{...field}
								id={field.name}
								type="password"
								autoComplete="new-password"
								disabled={isSubmitting}
								aria-invalid={fieldState.invalid}
							/>
							{fieldState.invalid ? (
								<FieldError errors={[fieldState.error]} />
							) : null}
						</Field>
					)}
				/>
			</div>

			{rootError ? <FieldError errors={[rootError]} className="text-sm" /> : null}

			<Button
				type="submit"
				disabled={isSubmitting}
				className="self-start transition-transform active:scale-[0.98]"
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
