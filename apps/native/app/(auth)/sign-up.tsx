import { useAuth, useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { GoogleOAuthButton } from "@/components/google-oauth-button";
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
			<View className="flex-1 bg-background px-5 pt-8">
				<Text className="mb-2 font-semibold text-2xl text-foreground tracking-tight">
					Verify your account
				</Text>
				<Text className="mb-4 text-muted-foreground text-sm leading-relaxed">
					Enter the code we sent to your email.
				</Text>
				<View className="gap-3">
					<Controller
						control={verifyForm.control}
						name="code"
						render={({ field: { onChange, value } }) => (
							<TextInput
								className="h-12 rounded-full border border-border bg-popover px-5 text-base text-foreground"
								value={value}
								placeholder="Enter your verification code"
								placeholderTextColor="#999"
								onChangeText={onChange}
								keyboardType="numeric"
							/>
						)}
					/>
					{verifyErrors.code ? (
						<Text className="ml-2 text-destructive text-xs">
							{verifyErrors.code.message}
						</Text>
					) : null}
					{errors.fields.code ? (
						<Text className="ml-2 text-destructive text-xs">
							{errors.fields.code.message}
						</Text>
					) : null}
					{verifyErrors.root ? (
						<Text className="ml-2 text-destructive text-xs">
							{verifyErrors.root.message}
						</Text>
					) : null}
					<Pressable
						className="mt-2 h-12 items-center justify-center rounded-full bg-primary active:opacity-70 disabled:opacity-50"
						onPress={onVerify}
						disabled={fetchStatus === "fetching"}
					>
						<Text className="font-semibold text-base text-primary-foreground">
							Verify
						</Text>
					</Pressable>
					<Pressable
						className="mt-1 h-10 items-center justify-center active:opacity-70"
						onPress={() => signUp.verifications.sendEmailCode()}
					>
						<Text className="font-semibold text-primary text-sm">
							I need a new code
						</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	const fieldErrors = credentialsForm.formState.errors;

	return (
		<View className="flex-1 bg-background px-5 pt-8">
			<Text className="mb-6 font-semibold text-2xl text-foreground tracking-tight">
				Sign up
			</Text>
			<View className="gap-4">
				<View className="gap-1">
					<Controller
						control={credentialsForm.control}
						name="email"
						render={({ field: { onChange, value } }) => (
							<TextInput
								className="h-12 rounded-full border border-border bg-popover px-5 text-base text-foreground"
								autoCapitalize="none"
								value={value}
								placeholder="Email"
								placeholderTextColor="#999"
								onChangeText={onChange}
								keyboardType="email-address"
							/>
						)}
					/>
					{fieldErrors.email ? (
						<Text className="ml-2 text-destructive text-xs">
							{fieldErrors.email.message}
						</Text>
					) : null}
					{errors.fields.emailAddress ? (
						<Text className="ml-2 text-destructive text-xs">
							{errors.fields.emailAddress.message}
						</Text>
					) : null}
				</View>
				<View className="gap-1">
					<Controller
						control={credentialsForm.control}
						name="password"
						render={({ field: { onChange, value } }) => (
							<TextInput
								className="h-12 rounded-full border border-border bg-popover px-5 text-base text-foreground"
								value={value}
								placeholder="Password"
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
				</View>
				{fieldErrors.root ? (
					<Text className="text-destructive text-xs">
						{fieldErrors.root.message}
					</Text>
				) : null}
				<Pressable
					className="mt-1 h-12 items-center justify-center rounded-full bg-primary active:opacity-70 disabled:opacity-50"
					onPress={onSubmit}
					disabled={fetchStatus === "fetching"}
				>
					<Text className="font-semibold text-base text-primary-foreground">
						Sign up
					</Text>
				</Pressable>
				<View className="relative py-1">
					<View className="absolute inset-0 items-center justify-center">
						<View className="h-px w-full bg-border" />
					</View>
					<View className="items-center">
						<Text className="bg-background px-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">
							Or
						</Text>
					</View>
				</View>
				<GoogleOAuthButton />
				<View className="mt-2 flex-row items-center justify-center gap-1">
					<Text className="text-muted-foreground text-sm">
						Already have an account?
					</Text>
					<Link href="/sign-in">
						<Text className="font-semibold text-foreground text-sm underline">
							Sign in
						</Text>
					</Link>
				</View>
				<View nativeID="clerk-captcha" />
			</View>
		</View>
	);
}
