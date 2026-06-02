import { useSignIn } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { GoogleOAuthButton } from "@/components/google-oauth-button";
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
			<View className="flex-1 bg-background px-5 pt-8">
				<Text className="mb-2 font-semibold text-2xl text-foreground tracking-tight">
					Verify your account
				</Text>
				{emailCodeFactor ? (
					<Text className="mb-4 text-muted-foreground text-sm leading-relaxed">
						We sent a verification code to {emailCodeFactor.safeIdentifier}.
					</Text>
				) : null}
				<Controller
					control={mfaForm.control}
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
				{mfaErrors.code ? (
					<Text className="mt-1 text-destructive text-xs">
						{mfaErrors.code.message}
					</Text>
				) : null}
				{errors.fields.code ? (
					<Text className="mt-1 text-destructive text-xs">
						{errors.fields.code.message}
					</Text>
				) : null}
				{mfaErrors.root ? (
					<Text className="mt-1 text-destructive text-xs">
						{mfaErrors.root.message}
					</Text>
				) : null}
				<Pressable
					className="mt-4 h-12 items-center justify-center rounded-full bg-primary active:opacity-70 disabled:opacity-50"
					onPress={onVerify}
					disabled={fetchStatus === "fetching"}
				>
					<Text className="font-semibold text-base text-primary-foreground">
						Verify
					</Text>
				</Pressable>
				<Pressable
					className="mt-3 h-10 items-center justify-center active:opacity-70"
					onPress={() => signIn.mfa.sendEmailCode()}
				>
					<Text className="font-semibold text-primary text-sm">
						I need a new code
					</Text>
				</Pressable>
			</View>
		);
	}

	const fieldErrors = credentialsForm.formState.errors;

	return (
		<View className="flex-1 bg-background px-5 pt-8">
			<Text className="mb-6 font-semibold text-2xl text-foreground tracking-tight">
				Sign in
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
					{errors.fields.identifier ? (
						<Text className="ml-2 text-destructive text-xs">
							{errors.fields.identifier.message}
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
				<View className="flex-row items-center justify-between px-2">
					<Link href="/forgot-password">
						<Text className="font-medium text-foreground text-sm underline">
							Forgot password?
						</Text>
					</Link>
					<Link href="/sign-up">
						<Text className="font-semibold text-foreground text-sm underline">
							Create account
						</Text>
					</Link>
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
						Sign in
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
			</View>
		</View>
	);
}
