import { useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
	type EmailVerificationCodeFormValues,
	emailVerificationCodeSchema,
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

export default function VerifyEmailPage() {
	const { signUp, errors, fetchStatus } = useSignUp();
	const router = useRouter();

	const form = useForm<EmailVerificationCodeFormValues>({
		resolver: zodResolver(emailVerificationCodeSchema),
		defaultValues: { code: "" },
	});

	const onVerify = form.handleSubmit(async ({ code }) => {
		if (!signUp) return;

		const { error } = await signUp.verifications.verifyEmailCode({ code });
		if (error) {
			form.setError("root", {
				message: error.longMessage ?? "Could not verify that code.",
			});
			return;
		}

		if (signUp.status === "complete") {
			await signUp.finalize({
				navigate: ({ session, decorateUrl }) => {
					if (session?.currentTask) return;
					pushDecoratedUrl(router, decorateUrl, "/");
				},
			});
			return;
		}

		form.setError("root", {
			message: "That code did not complete sign-up. Please try again.",
		});
	});

	const resendCode = async () => {
		if (!signUp) return;
		const { error } = await signUp.verifications.sendEmailCode();
		if (error) {
			form.setError("root", {
				message: error.longMessage ?? "Could not send a new code.",
			});
		}
	};

	if (!signUp) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Loading verification</Text>
				<Text style={styles.description}>
					Please wait while we prepare email verification.
				</Text>
				<Link href="/sign-up">
					<Text style={styles.linkText}>Back to sign up</Text>
				</Link>
			</View>
		);
	}

	const fieldErrors = form.formState.errors;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Verify your email</Text>
			<Text style={styles.description}>
				Enter the one-time code we sent to your email.
			</Text>
			<Controller
				control={form.control}
				name="code"
				render={({ field: { onChange, value } }) => (
					<TextInput
						style={styles.input}
						value={value}
						placeholder="Verification code"
						placeholderTextColor="#666666"
						onChangeText={onChange}
						keyboardType="numeric"
						textContentType="oneTimeCode"
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
				onPress={() => void resendCode()}
			>
				<Text style={styles.secondaryButtonText}>Send a new code</Text>
			</Pressable>
			<Link href="/sign-up">
				<Text style={styles.linkText}>Back to sign up</Text>
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
		gap: 12,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		textAlign: "center",
	},
	description: {
		color: "#555555",
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#fff",
		alignSelf: "stretch",
	},
	button: {
		alignSelf: "stretch",
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
		alignSelf: "stretch",
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
		marginTop: 8,
	},
	error: {
		alignSelf: "stretch",
		color: "#d32f2f",
		fontSize: 12,
		marginTop: -8,
	},
});
