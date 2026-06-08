import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

import { AccountScreenHeader } from "@/components/account/account-screen-header";
import { useMutationToast } from "@/lib/mutation-toast";

function clerkErrorMessage(err: unknown, fallback: string): string {
	const maybe = err as { errors?: { message?: string }[] } | undefined;
	const first = maybe?.errors?.[0]?.message;
	if (first) return first;
	if (err instanceof Error) return err.message;
	return fallback;
}

export default function ChangePasswordScreen() {
	const { user, isLoaded } = useUser();
	const toast = useMutationToast();
	const placeholderColor = useThemeColor("field-placeholder");

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!isLoaded) return;
		if (!user?.passwordEnabled) {
			router.replace("/(tabs)/account");
		}
	}, [isLoaded, user?.passwordEnabled]);

	const handleSubmit = async () => {
		if (!currentPassword.trim()) {
			toast.error(new Error("missing"), "Enter your current password.");
			return;
		}
		if (newPassword.length < 8) {
			toast.error(
				new Error("weak"),
				"New password must be at least 8 characters.",
			);
			return;
		}
		setSaving(true);
		try {
			await user?.updatePassword({
				currentPassword,
				newPassword,
			});
			toast.success("Password updated.");
			router.back();
		} catch (err) {
			toast.error(
				err,
				clerkErrorMessage(err, "Could not update password. Please try again."),
			);
		} finally {
			setSaving(false);
		}
	};

	if (!isLoaded || !user?.passwordEnabled) {
		return null;
	}

	return (
		<View className="flex-1 bg-background">
			<AccountScreenHeader title="Update Password" />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1"
			>
				<ScrollView
					className="flex-1"
					contentContainerClassName="px-4 pt-6 gap-5"
					keyboardShouldPersistTaps="handled"
				>
					<View className="gap-2">
						<Text className="font-semibold text-foreground text-lg">
							Current Password
						</Text>
						<TextInput
							value={currentPassword}
							onChangeText={setCurrentPassword}
							placeholder="Type here..."
							placeholderTextColor={placeholderColor}
							secureTextEntry
							autoCapitalize="none"
							className="h-14 rounded-2xl border border-border bg-background px-4 text-base text-foreground"
						/>
					</View>

					<View className="gap-2">
						<Text className="font-semibold text-foreground text-lg">
							New Password
						</Text>
						<TextInput
							value={newPassword}
							onChangeText={setNewPassword}
							placeholder="Type here..."
							placeholderTextColor={placeholderColor}
							secureTextEntry
							autoCapitalize="none"
							className="h-14 rounded-2xl border border-border bg-background px-4 text-base text-foreground"
						/>
					</View>

					<Pressable
						onPress={() => void handleSubmit()}
						disabled={saving}
						accessibilityRole="button"
						accessibilityLabel="Update Password"
						className="mt-2 h-14 flex-row items-center justify-center gap-2 rounded-full bg-primary active:opacity-90 disabled:opacity-70"
					>
						{saving ? <ActivityIndicator color="#ffffff" /> : null}
						<Text className="font-semibold text-base text-primary-foreground">
							{saving ? "Updating…" : "Update Password"}
						</Text>
					</Pressable>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
