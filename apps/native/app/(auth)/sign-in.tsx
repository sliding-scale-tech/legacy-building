import { useSignIn } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
	type SignInFormValues,
	type SignInMfaCodeFormValues,
	signInMfaCodeSchema,
	signInSchema,
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

export default function Page() {
	const { signIn, errors, fetchStatus } = useSignIn();
	const router = useRouter();

	const credentialsForm = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: "", password: "" },
	});

	const mfaForm = useForm<SignInMfaCodeFormValues>({
		resolver: zodResolver(signInMfaCodeSchema),
		defaultValues: { code: "" },
	});

	const emailCodeFactor = signIn.supportedSecondFactors.find(
		(factor) => factor.strategy === "email_code",
	);
	const requiresEmailCode =
		signIn.status === "needs_client_trust" ||
		(signIn.status === "needs_second_factor" && !!emailCodeFactor);

	const onSubmit = credentialsForm.handleSubmit(async ({ email, password }) => {
		const { error } = await signIn.password({
			emailAddress: email.trim(),
			password,
		});

		if (error) {
			console.error(JSON.stringify(error, null, 2));
			credentialsForm.setError("root", {
				message: error.longMessage ?? "Unable to sign in. Please try again.",
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
		} else if (
			signIn.status === "needs_second_factor" ||
			signIn.status === "needs_client_trust"
		) {
			if (emailCodeFactor) {
				await signIn.mfa.sendEmailCode();
			} else {
				credentialsForm.setError("root", {
					message:
						"A second factor is required but email codes are unavailable.",
				});
			}
		} else {
			credentialsForm.setError("root", {
				message: "Sign-in could not be completed.",
			});
		}
	});

	const onVerify = mfaForm.handleSubmit(async ({ code }) => {
		await signIn.mfa.verifyEmailCode({ code });

		if (signIn.status === "complete") {
			await signIn.finalize({
				navigate: ({ session, decorateUrl }) => {
					if (session?.currentTask) return;
					pushDecoratedUrl(router, decorateUrl, "/");
				},
			});
		} else {
			mfaForm.setError("root", {
				message: "That code did not complete sign-in. Please try again.",
			});
		}
	});

	if (requiresEmailCode) {
		const mfaErrors = mfaForm.formState.errors;
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Verify your account</Text>
				{emailCodeFactor ? (
					<Text style={styles.helper}>
						We sent a verification code to {emailCodeFactor.safeIdentifier}.
					</Text>
				) : null}
				<Controller
					control={mfaForm.control}
					name="code"
					render={({ field: { onChange, value } }) => (
						<TextInput
							style={styles.input}
							value={value}
							placeholder="Enter your verification code"
							placeholderTextColor="#666666"
							onChangeText={onChange}
							keyboardType="numeric"
						/>
					)}
				/>
				{mfaErrors.code ? (
					<Text style={styles.error}>{mfaErrors.code.message}</Text>
				) : null}
				{errors.fields.code ? (
					<Text style={styles.error}>{errors.fields.code.message}</Text>
				) : null}
				{mfaErrors.root ? (
					<Text style={styles.error}>{mfaErrors.root.message}</Text>
				) : null}
				<Pressable
					style={({ pressed }) => [
						styles.button,
						fetchStatus === "fetching" && styles.buttonDisabled,
						pressed && styles.buttonPressed,
					]}
					onPress={onVerify}
					disabled={fetchStatus === "fetching"}
				>
					<Text style={styles.buttonText}>Verify</Text>
				</Pressable>
				<Pressable
					style={({ pressed }) => [
						styles.secondaryButton,
						pressed && styles.buttonPressed,
					]}
					onPress={() => signIn.mfa.sendEmailCode()}
				>
					<Text style={styles.secondaryButtonText}>I need a new code</Text>
				</Pressable>
			</View>
		);
	}

	const fieldErrors = credentialsForm.formState.errors;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Sign in</Text>
			<Text style={styles.label}>Email address</Text>
			<Controller
				control={credentialsForm.control}
				name="email"
				render={({ field: { onChange, value } }) => (
					<TextInput
						style={styles.input}
						autoCapitalize="none"
						value={value}
						placeholder="Enter email"
						placeholderTextColor="#666666"
						onChangeText={onChange}
						keyboardType="email-address"
					/>
				)}
			/>
			{fieldErrors.email ? (
				<Text style={styles.error}>{fieldErrors.email.message}</Text>
			) : null}
			{errors.fields.identifier ? (
				<Text style={styles.error}>{errors.fields.identifier.message}</Text>
			) : null}
			<Text style={styles.label}>Password</Text>
			<Controller
				control={credentialsForm.control}
				name="password"
				render={({ field: { onChange, value } }) => (
					<TextInput
						style={styles.input}
						value={value}
						placeholder="Enter password"
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
				onPress={onSubmit}
				disabled={fetchStatus === "fetching"}
			>
				<Text style={styles.buttonText}>Sign in</Text>
			</Pressable>
			<Link href="/forgot-password">
				<Text style={styles.linkText}>Forgot password?</Text>
			</Link>
			<View style={styles.linkContainer}>
				<Text>Don't have an account? </Text>
				<Link href="/sign-up">
					<Text style={styles.linkText}>Sign up</Text>
				</Link>
			</View>
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
	label: {
		fontWeight: "600",
		fontSize: 14,
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
	linkContainer: {
		flexDirection: "row",
		gap: 4,
		marginTop: 12,
		alignItems: "center",
	},
	linkText: {
		color: "#0a7ea4",
		fontWeight: "600",
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
