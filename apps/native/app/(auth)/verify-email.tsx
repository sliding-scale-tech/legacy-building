import { useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
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
			<View className="flex-1 items-center justify-center bg-background px-5">
				<Text className="font-semibold text-2xl text-foreground tracking-tight">
					Loading verification
				</Text>
				<Text className="mt-2 text-center text-muted-foreground text-sm leading-relaxed">
					Please wait while we prepare email verification.
				</Text>
				<Link href="/sign-up">
					<Text className="mt-4 font-semibold text-primary text-sm">
						Back to sign up
					</Text>
				</Link>
			</View>
		);
	}

	const fieldErrors = form.formState.errors;

	return (
		<View className="flex-1 items-center justify-center bg-background px-5">
			<Text className="font-semibold text-2xl text-foreground tracking-tight">
				Verify your email
			</Text>
			<Text className="mt-2 mb-4 text-center text-muted-foreground text-sm leading-relaxed">
				Enter the one-time code we sent to your email.
			</Text>
			<View className="w-full gap-3">
				<Controller
					control={form.control}
					name="code"
					render={({ field: { onChange, value } }) => (
						<TextInput
							className="h-12 rounded-full border border-border bg-popover px-5 text-base text-foreground"
							value={value}
							placeholder="Verification code"
							placeholderTextColor="#999"
							onChangeText={onChange}
							keyboardType="numeric"
							textContentType="oneTimeCode"
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
					onPress={onVerify}
					disabled={fetchStatus === "fetching"}
				>
					<Text className="font-semibold text-base text-primary-foreground">
						Verify
					</Text>
				</Pressable>
				<Pressable
					className="mt-1 h-10 items-center justify-center active:opacity-70"
					onPress={() => void resendCode()}
				>
					<Text className="font-semibold text-primary text-sm">
						Send a new code
					</Text>
				</Pressable>
				<Link href="/sign-up" className="self-center">
					<Text className="mt-1 font-semibold text-primary text-sm">
						Back to sign up
					</Text>
				</Link>
			</View>
		</View>
	);
}
