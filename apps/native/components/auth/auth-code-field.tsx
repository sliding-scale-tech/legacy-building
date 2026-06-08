import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthField } from "@/components/auth/auth-field";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { signInMfaCodeSchema } from "@/lib/auth/schemas";

type AuthCodeFieldProps = {
	hint: string;
	fieldError?: string;
	rootError?: string;
	loading?: boolean;
	onVerify: (code: string) => void | Promise<void>;
	onResend?: () => void | Promise<void>;
	onStartOver?: () => void | Promise<void>;
};

/** Isolated code entry — local state avoids losing input when Clerk hooks re-render the parent. */
export function AuthCodeField({
	hint,
	fieldError,
	rootError,
	loading,
	onVerify,
	onResend,
	onStartOver,
}: AuthCodeFieldProps) {
	const [code, setCode] = useState("");
	const [localError, setLocalError] = useState<string | undefined>();

	const handleVerify = () => {
		setLocalError(undefined);
		const parsed = signInMfaCodeSchema.safeParse({ code });
		if (!parsed.success) {
			setLocalError(parsed.error.issues[0]?.message ?? "Enter a valid code.");
			return;
		}
		void onVerify(parsed.data.code);
	};

	return (
		<View className="gap-5">
			<Text className="text-[15px] text-primary-foreground leading-6">
				{hint}
			</Text>
			<AuthField
				label="Verification code"
				value={code}
				onChangeText={(text) => {
					setCode(text);
					setLocalError(undefined);
				}}
				keyboardType="number-pad"
				autoComplete="one-time-code"
				textContentType="oneTimeCode"
				error={localError ?? fieldError}
			/>
			{rootError ? (
				<Text className="text-red-300 text-xs">{rootError}</Text>
			) : null}
			<AuthPrimaryButton
				label="Verify"
				onPress={handleVerify}
				loading={loading}
			/>
			{onResend || onStartOver ? (
				<View className="flex-row flex-wrap justify-center gap-4">
					{onResend ? (
						<Pressable
							onPress={() => void onResend()}
							className="active:opacity-60"
						>
							<Text className="font-semibold text-primary-foreground text-sm underline">
								Resend code
							</Text>
						</Pressable>
					) : null}
					{onStartOver ? (
						<Pressable
							onPress={() => void onStartOver()}
							className="active:opacity-60"
						>
							<Text className="text-primary-foreground/80 text-sm">
								Start over
							</Text>
						</Pressable>
					) : null}
				</View>
			) : null}
		</View>
	);
}
