import { useAuth, useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
	type EmailVerificationCodeFormValues,
	emailVerificationCodeSchema,
	type SignUpFormValues,
	signUpSchema,
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
	const { signUp, errors, fetchStatus } = useSignUp();
	const { isSignedIn } = useAuth();
	const router = useRouter();

	const credentialsForm = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: { email: "", password: "" },
	});

	const verifyForm = useForm<EmailVerificationCodeFormValues>({
		resolver: zodResolver(emailVerificationCodeSchema),
		defaultValues: { code: "" },
	});

	const onSubmit = credentialsForm.handleSubmit(async ({ email, password }) => {
		const { error } = await signUp.password({
			emailAddress: email.trim(),
			password,
		});

		if (error) {
			console.error(JSON.stringify(error, null, 2));
			credentialsForm.setError("root", {
				message: error.longMessage ?? "Unable to sign up. Please try again.",
			});
			return;
		}

		await signUp.verifications.sendEmailCode();
		router.push("/verify-email" as Href);
	});

	const onVerify = verifyForm.handleSubmit(async ({ code }) => {
		await signUp.verifications.verifyEmailCode({ code });

		if (signUp.status === "complete") {
			await signUp.finalize({
				navigate: ({ session, decorateUrl }) => {
					if (session?.currentTask) return;
					pushDecoratedUrl(router, decorateUrl, "/");
				},
			});
		} else {
			verifyForm.setError("root", {
				message: "That code did not complete sign-up. Please try again.",
			});
		}
	});

	if (signUp.status === "complete" || isSignedIn) {
		return null;
	}

	if (
		signUp.status === "missing_requirements" &&
		signUp.unverifiedFields.includes("email_address") &&
		signUp.missingFields.length === 0
	) {
		const verifyErrors = verifyForm.formState.errors;
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Verify your account</Text>
				<Controller
					control={verifyForm.control}
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
				{verifyErrors.code ? (
					<Text style={styles.error}>{verifyErrors.code.message}</Text>
				) : null}
				{errors.fields.code ? (
					<Text style={styles.error}>{errors.fields.code.message}</Text>
				) : null}
				{verifyErrors.root ? (
					<Text style={styles.error}>{verifyErrors.root.message}</Text>
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
					onPress={() => signUp.verifications.sendEmailCode()}
				>
					<Text style={styles.secondaryButtonText}>I need a new code</Text>
				</Pressable>
			</View>
		);
	}

	const fieldErrors = credentialsForm.formState.errors;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Sign up</Text>
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
			{errors.fields.emailAddress ? (
				<Text style={styles.error}>{errors.fields.emailAddress.message}</Text>
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
				<Text style={styles.buttonText}>Sign up</Text>
			</Pressable>
			<View style={styles.linkContainer}>
				<Text>Already have an account? </Text>
				<Link href="/sign-in">
					<Text style={styles.linkText}>Sign in</Text>
				</Link>
			</View>
			<View nativeID="clerk-captcha" />
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
});
