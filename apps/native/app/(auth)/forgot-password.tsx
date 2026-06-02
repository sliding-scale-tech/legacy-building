import { useSignIn } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import {
	type ForgotPasswordCodeFormValues,
	type ForgotPasswordEmailFormValues,
	forgotPasswordCodeSchema,
	forgotPasswordEmailSchema,
	type NewPasswordFormValues,
	newPasswordSchema,
} from "@/lib/auth/schemas";

function pushDecoratedUrl(
	router: ReturnType<typeof useRouter>,
	decorateUrl: (url: string) => string,
	href: string,
) {
	const url = decorateUrl(href);
	const nextHref = url.startsWith("http") ? new URL(url).pathname : url;
	router.push(nextHref as Href);
}

export default function ForgotPasswordPage() {
	const { signIn, errors, fetchStatus } = useSignIn();
	const router = useRouter();

	const emailForm = useForm<ForgotPasswordEmailFormValues>({
		resolver: zodResolver(forgotPasswordEmailSchema),
		defaultValues: { email: "" },
	});
	const codeForm = useForm<ForgotPasswordCodeFormValues>({
		resolver: zodResolver(forgotPasswordCodeSchema),
		defaultValues: { code: "" },
	});
	const passwordForm = useForm<NewPasswordFormValues>({
		resolver: zodResolver(newPasswordSchema),
		defaultValues: { password: "" },
	});

	const sendCode = emailForm.handleSubmit(async ({ email }) => {
		if (!signIn) return;
		const { error: createError } = await signIn.create({
			identifier: email.trim(),
		});
		if (createError) {
			emailForm.setError("root", {
				message: createError.longMessage ?? "Could not start password reset.",
			});
			return;
		}

		const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
		if (sendError) {
			emailForm.setError("root", {
				message: sendError.longMessage ?? "Could not send reset code.",
			});
		}
	});

	const verifyCode = codeForm.handleSubmit(async ({ code }) => {
		if (!signIn) return;
		const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
		if (error) {
			codeForm.setError("root", {
				message: error.longMessage ?? "Could not verify reset code.",
			});
		}
	});

	const submitPassword = passwordForm.handleSubmit(async ({ password }) => {
		if (!signIn) return;
		const { error } = await signIn.resetPasswordEmailCode.submitPassword({
			password,
		});
		if (error) {
			passwordForm.setError("root", {
				message: error.longMessage ?? "Could not update password.",
			});
			return;
		}

		if (signIn.status === "complete") {
			await signIn.finalize({
				navigate: ({ session, decorateUrl }) => {
					if (session?.currentTask) return;
					pushDecoratedUrl(router, decorateUrl, "/");
				},
			});
			return;
		}

		passwordForm.setError("root", {
			message: "Password reset could not be completed.",
		});
	});

	if (signIn.status === "needs_new_password") {
		const fieldErrors = passwordForm.formState.errors;
		return (
			<View className="flex-1 bg-background px-5 pt-8">
				<Text className="mb-2 font-semibold text-2xl text-foreground tracking-tight">
					Set new password
				</Text>
				<Text className="mb-4 text-muted-foreground text-sm leading-relaxed">
					Choose a new password for your account.
				</Text>
				<View className="gap-3">
					<Controller
						control={passwordForm.control}
						name="password"
						render={({ field: { onChange, value } }) => (
							<TextInput
								className="h-12 rounded-full border border-border bg-popover px-5 text-base text-foreground"
								value={value}
								placeholder="New password"
								placeholderTextColor="#999"
								secureTextEntry
								onChangeText={onChange}
							/>
						)}
					/>
					{fieldErrors.password ? (
						<Text className="ml-2 text-destructive text-xs">
							{fieldErrors.password.message}
						</Text>
					) : null}
					{errors.fields.password ? (
						<Text className="ml-2 text-destructive text-xs">
							{errors.fields.password.message}
						</Text>
					) : null}
					{fieldErrors.root ? (
						<Text className="text-destructive text-xs">
							{fieldErrors.root.message}
						</Text>
					) : null}
					<Pressable
						className="mt-2 h-12 items-center justify-center rounded-full bg-primary active:opacity-70 disabled:opacity-50"
						disabled={fetchStatus === "fetching"}
						onPress={submitPassword}
					>
						<Text className="font-semibold text-base text-primary-foreground">
							Update password
						</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	if (signIn.status === "needs_first_factor") {
		const fieldErrors = codeForm.formState.errors;
		return (
			<View className="flex-1 bg-background px-5 pt-8">
				<Text className="mb-2 font-semibold text-2xl text-foreground tracking-tight">
					Enter reset code
				</Text>
				<Text className="mb-4 text-muted-foreground text-sm leading-relaxed">
					Check your email for a reset code.
				</Text>
				<View className="gap-3">
					<Controller
						control={codeForm.control}
						name="code"
						render={({ field: { onChange, value } }) => (
							<TextInput
								className="h-12 rounded-full border border-border bg-popover px-5 text-base text-foreground"
								value={value}
								placeholder="Reset code"
								placeholderTextColor="#999"
								keyboardType="numeric"
								onChangeText={onChange}
							/>
						)}
					/>
					{fieldErrors.code ? (
						<Text className="ml-2 text-destructive text-xs">
							{fieldErrors.code.message}
						</Text>
					) : null}
					{errors.fields.code ? (
						<Text className="ml-2 text-destructive text-xs">
							{errors.fields.code.message}
						</Text>
					) : null}
					{fieldErrors.root ? (
						<Text className="text-destructive text-xs">
							{fieldErrors.root.message}
						</Text>
					) : null}
					<Pressable
						className="mt-2 h-12 items-center justify-center rounded-full bg-primary active:opacity-70 disabled:opacity-50"
						disabled={fetchStatus === "fetching"}
						onPress={verifyCode}
					>
						<Text className="font-semibold text-base text-primary-foreground">
							Verify code
						</Text>
					</Pressable>
					<Pressable
						className="mt-1 h-10 items-center justify-center active:opacity-70"
						onPress={() => void signIn.resetPasswordEmailCode.sendCode()}
					>
						<Text className="font-semibold text-primary text-sm">
							Send a new code
						</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	const fieldErrors = emailForm.formState.errors;

	return (
		<View className="flex-1 bg-background px-5 pt-8">
			<Text className="mb-2 font-semibold text-2xl text-foreground tracking-tight">
				Reset password
			</Text>
			<Text className="mb-4 text-muted-foreground text-sm leading-relaxed">
				We will send a reset code to your email.
			</Text>
			<View className="gap-3">
				<Controller
					control={emailForm.control}
					name="email"
					render={({ field: { onChange, value } }) => (
						<TextInput
							className="h-12 rounded-full border border-border bg-popover px-5 text-base text-foreground"
							autoCapitalize="none"
							value={value}
							placeholder="Email"
							placeholderTextColor="#999"
							keyboardType="email-address"
							onChangeText={onChange}
						/>
					)}
				/>
				{fieldErrors.email ? (
					<Text className="ml-2 text-destructive text-xs">
						{fieldErrors.email.message}
					</Text>
				) : null}
				{errors.fields.identifier ? (
					<Text className="ml-2 text-destructive text-xs">
						{errors.fields.identifier.message}
					</Text>
				) : null}
				{fieldErrors.root ? (
					<Text className="text-destructive text-xs">
						{fieldErrors.root.message}
					</Text>
				) : null}
				<Pressable
					className="mt-2 h-12 items-center justify-center rounded-full bg-primary active:opacity-70 disabled:opacity-50"
					disabled={fetchStatus === "fetching"}
					onPress={sendCode}
				>
					<Text className="font-semibold text-base text-primary-foreground">
						Send reset code
					</Text>
				</Pressable>
				<Link href="/sign-in">
					<Text className="mt-2 font-semibold text-primary text-sm">
						Back to sign in
					</Text>
				</Link>
			</View>
		</View>
	);
}
