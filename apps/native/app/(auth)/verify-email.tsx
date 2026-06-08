import { useSignUp } from "@clerk/expo";
import { firstClerkErrorMessage } from "@legacy-building/ui/lib/clerk-errors";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { AuthCodeField } from "@/components/auth/auth-code-field";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthScreen } from "@/components/auth/auth-screen";

function pushDecoratedUrl(
	router: ReturnType<typeof useRouter>,
	decorateUrl: (url: string) => string,
	href: string,
) {
	const url = decorateUrl(href);
	const nextHref = url.startsWith("http") ? new URL(url).pathname : url;
	router.replace(nextHref as Href);
}

export default function VerifyEmailPage() {
	const { signUp, errors, fetchStatus } = useSignUp();
	const router = useRouter();
	const [rootError, setRootError] = useState<string | undefined>();

	const onVerify = async (code: string) => {
		if (!signUp) return;
		setRootError(undefined);

		const { error } = await signUp.verifications.verifyEmailCode({ code });
		if (error) {
			setRootError(
				firstClerkErrorMessage(error) ?? "Could not verify that code.",
			);
			return;
		}

		if (signUp.status === "complete") {
			const { error: finalizeError } = await signUp.finalize({
				navigate: ({ session, decorateUrl }) => {
					if (session?.currentTask) return;
					pushDecoratedUrl(router, decorateUrl, "/(tabs)");
				},
			});
			if (finalizeError) {
				setRootError(
					firstClerkErrorMessage(finalizeError) ?? "Could not finish sign-up.",
				);
			}
			return;
		}

		setRootError("That code did not complete sign-up. Please try again.");
	};

	const resendCode = async () => {
		if (!signUp) return;
		setRootError(undefined);

		const { error } = await signUp.verifications.sendEmailCode();
		if (error) {
			setRootError(
				firstClerkErrorMessage(error) ?? "Could not send a new code.",
			);
		}
	};

	if (!signUp) {
		return (
			<AuthScreen
				header={
					<AuthHeader
						title="Verify email"
						backHref="/sign-up"
						backLabel="Back"
					/>
				}
			>
				<Text className="text-[15px] text-primary-foreground leading-6">
					Loading verification…
				</Text>
			</AuthScreen>
		);
	}

	return (
		<AuthScreen
			header={
				<AuthHeader title="Verify email" backHref="/sign-up" backLabel="Back" />
			}
		>
			<AuthCodeField
				hint="Enter the one-time code we sent to your email."
				fieldError={errors.fields.code?.message}
				rootError={rootError}
				loading={fetchStatus === "fetching"}
				onVerify={onVerify}
				onResend={resendCode}
			/>
		</AuthScreen>
	);
}
