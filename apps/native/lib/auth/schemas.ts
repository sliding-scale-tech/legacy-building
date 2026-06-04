import { z } from "zod";

export const signInSchema = z.object({
	email: z.string().min(1, "Enter your email.").email("Enter a valid email."),
	password: z.string().min(1, "Enter your password."),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signInMfaCodeSchema = z.object({
	code: z
		.string()
		.min(1, "Enter the verification code.")
		.regex(/^\d+$/, "Enter a valid numeric code."),
});

export type SignInMfaCodeFormValues = z.infer<typeof signInMfaCodeSchema>;

const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters.")
	.regex(/[0-9]/, "Include a number.")
	.regex(/[A-Z]/, "Include a capital letter.")
	.regex(/[^A-Za-z0-9]/, "Include a symbol.");

export const signUpSchema = z
	.object({
		email: z.string().min(1, "Enter your email.").email("Enter a valid email."),
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Confirm your password."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match.",
		path: ["confirmPassword"],
	});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const emailVerificationCodeSchema = z.object({
	code: z
		.string()
		.min(1, "Enter the verification code.")
		.regex(/^\d+$/, "Enter a valid numeric code."),
});

export type EmailVerificationCodeFormValues = z.infer<
	typeof emailVerificationCodeSchema
>;

export const forgotPasswordEmailSchema = z.object({
	email: z.string().min(1, "Enter your email.").email("Enter a valid email."),
});

export type ForgotPasswordEmailFormValues = z.infer<
	typeof forgotPasswordEmailSchema
>;

export const forgotPasswordCodeSchema = z.object({
	code: z
		.string()
		.min(1, "Enter the reset code.")
		.regex(/^\d+$/, "Enter a valid numeric code."),
});

export type ForgotPasswordCodeFormValues = z.infer<
	typeof forgotPasswordCodeSchema
>;

export const newPasswordSchema = z.object({
	password: passwordSchema,
});

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
