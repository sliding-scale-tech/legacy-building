import { useUser } from "@clerk/expo";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { useMutation } from "convex/react";
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
import { useNativeCurrentUser } from "@/hooks/use-native-current-user";
import { useMutationToast } from "@/lib/mutation-toast";

export default function PersonalDetailsScreen() {
	const { convexUser } = useNativeCurrentUser();
	const { user } = useUser();
	const updateProfile = useMutation(api.user.mutations.updateProfile);
	const toast = useMutationToast();
	const placeholderColor = useThemeColor("field-placeholder");

	const currentUsername =
		convexUser?.name ?? user?.username ?? user?.fullName ?? "";

	const [username, setUsername] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!currentUsername) return;
		setUsername((prev) => (prev === "" ? currentUsername : prev));
	}, [currentUsername]);

	const handleSave = async () => {
		const trimmed = username.trim();
		if (trimmed.length < 2) {
			toast.error(
				new Error("too short"),
				"Username must be at least 2 characters.",
			);
			return;
		}
		setSaving(true);
		try {
			await updateProfile({ name: trimmed });
			toast.success("Username updated.");
			router.back();
		} catch (err) {
			toast.error(err, "Could not update username. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<AccountScreenHeader title="Update Details" />

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
							Update Username
						</Text>
						<TextInput
							value={username}
							onChangeText={setUsername}
							placeholder="Type here..."
							placeholderTextColor={placeholderColor}
							autoCapitalize="none"
							className="h-14 rounded-2xl border border-border bg-background px-4 text-base text-foreground"
						/>
					</View>

					<Pressable
						onPress={() => void handleSave()}
						disabled={saving}
						accessibilityRole="button"
						accessibilityLabel="Save"
						className="h-14 flex-row items-center justify-center gap-2 rounded-full bg-primary active:opacity-90 disabled:opacity-70"
					>
						{saving ? <ActivityIndicator color="#ffffff" /> : null}
						<Text className="font-semibold text-base text-primary-foreground">
							{saving ? "Saving…" : "Save"}
						</Text>
					</Pressable>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
