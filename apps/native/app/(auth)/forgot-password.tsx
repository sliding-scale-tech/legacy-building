import { useSignIn } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
	type ForgotPasswordCodeFormValues,
	forgotPasswordCodeSchema,
	type ForgotPasswordEmailFormValues,
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

		const { error: sendError } =
			await signIn.resetPasswordEmailCode.sendCode();
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
			<View style={styles.container}>
				<Text style={styles.title}>Set new password</Text>
				<Text style={styles.helper}>Choose a new password for your account.</Text>
				<Controller
					control={passwordForm.control}
					name="password"
					render={({ field: { onChange, value } }) => (
						<TextInput
							style={styles.input}
							value={value}
							placeholder="New password"
							placeholderTextColor="#666666"
							secureTextEntry
							onChangeText={onChange}
						/>
					)}
				/>
				{fieldErrors.password ? (
					<Text style={styles.error}>{fieldErrors.password.message}</Text>
				) : null}
				{errors.fields.password ? (
					<Text style={styles.error}>{errors.fields.password.message}</Text>
				) : null}
				{fieldErrors.root ? (
					<Text style={styles.error}>{fieldErrors.root.message}</Text>
				) : null}
				<Pressable
					style={({ pressed }) => [
						styles.button,
						fetchStatus === "fetching" && styles.buttonDisabled,
						pressed && styles.buttonPressed,
					]}
					disabled={fetchStatus === "fetching"}
					onPress={submitPassword}
				>
					<Text style={styles.buttonText}>Update password</Text>
				</Pressable>
			</View>
		);
	}

	if (signIn.status === "needs_first_factor") {
		const fieldErrors = codeForm.formState.errors;
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Enter reset code</Text>
				<Text style={styles.helper}>Check your email for a reset code.</Text>
				<Controller
					control={codeForm.control}
					name="code"
					render={({ field: { onChange, value } }) => (
						<TextInput
							style={styles.input}
							value={value}
							placeholder="Reset code"
							placeholderTextColor="#666666"
							keyboardType="numeric"
							onChangeText={onChange}
						/>
					)}
				/>
				{fieldErrors.code ? (
					<Text style={styles.error}>{fieldErrors.code.message}</Text>
				) : null}
				{errors.fields.code ? (
					<Text style={styles.error}>{errors.fields.code.message}</Text>
				) : null}
				{fieldErrors.root ? (
					<Text style={styles.error}>{fieldErrors.root.message}</Text>
				) : null}
				<Pressable
					style={({ pressed }) => [
						styles.button,
						fetchStatus === "fetching" && styles.buttonDisabled,
						pressed && styles.buttonPressed,
					]}
					disabled={fetchStatus === "fetching"}
					onPress={verifyCode}
				>
					<Text style={styles.buttonText}>Verify code</Text>
				</Pressable>
				<Pressable
					style={({ pressed }) => [
						styles.secondaryButton,
						pressed && styles.buttonPressed,
					]}
					onPress={() => void signIn.resetPasswordEmailCode.sendCode()}
				>
					<Text style={styles.secondaryButtonText}>Send a new code</Text>
				</Pressable>
			</View>
		);
	}

	const fieldErrors = emailForm.formState.errors;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Reset password</Text>
			<Text style={styles.helper}>We will send a reset code to your email.</Text>
			<Controller
				control={emailForm.control}
				name="email"
				render={({ field: { onChange, value } }) => (
					<TextInput
						style={styles.input}
						autoCapitalize="none"
						value={value}
						placeholder="Enter email"
						placeholderTextColor="#666666"
						keyboardType="email-address"
						onChangeText={onChange}
					/>
				)}
			/>
			{fieldErrors.email ? (
				<Text style={styles.error}>{fieldErrors.email.message}</Text>
			) : null}
			{errors.fields.identifier ? (
				<Text style={styles.error}>{errors.fields.identifier.message}</Text>
			) : null}
			{fieldErrors.root ? (
				<Text style={styles.error}>{fieldErrors.root.message}</Text>
			) : null}
			<Pressable
				style={({ pressed }) => [
					styles.button,
					fetchStatus === "fetching" && styles.buttonDisabled,
					pressed && styles.buttonPressed,
				]}
				disabled={fetchStatus === "fetching"}
				onPress={sendCode}
			>
				<Text style={styles.buttonText}>Send reset code</Text>
			</Pressable>
			<Link href="/sign-in">
				<Text style={styles.linkText}>Back to sign in</Text>
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 12,
	},
	title: {
		marginBottom: 8,
		fontSize: 24,
		fontWeight: "700",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#fff",
	},
	button: {
		backgroundColor: "#0a7ea4",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	buttonPressed: {
		opacity: 0.7,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
	},
	secondaryButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	secondaryButtonText: {
		color: "#0a7ea4",
		fontWeight: "600",
	},
	linkText: {
		color: "#0a7ea4",
		fontWeight: "600",
		marginTop: 12,
	},
	error: {
		color: "#d32f2f",
		fontSize: 12,
		marginTop: -8,
	},
	helper: {
		color: "#555555",
		fontSize: 13,
	},
});
