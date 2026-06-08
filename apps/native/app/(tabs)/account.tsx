import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useThemeColor } from "heroui-native/hooks";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNativeCurrentUser } from "@/hooks/use-native-current-user";
import { messageFromError } from "@/lib/error-utils";
import { nativeLegalRoutes } from "@/lib/legal-routes";
import { nativeLegalUrl } from "@/lib/native-legal-url";

type AccountRowProps = {
	title: string;
	subtitle?: string;
	onPress: () => void;
	chevronColor: string;
};

function AccountRow({
	title,
	subtitle,
	onPress,
	chevronColor,
}: AccountRowProps) {
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={title}
			className="flex-row items-center justify-between border-border border-b bg-background px-5 py-4 active:opacity-70"
		>
			<View className="min-w-0 flex-1 gap-1">
				<Text className="font-medium text-foreground text-lg">{title}</Text>
				{subtitle ? (
					<Text className="text-muted-foreground text-sm" numberOfLines={1}>
						{subtitle}
					</Text>
				) : null}
			</View>
			<Ionicons name="chevron-forward" size={22} color={chevronColor} />
		</Pressable>
	);
}

export default function AccountScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { user } = useUser();
	const { signOut } = useClerk();
	const { convexUser } = useNativeCurrentUser();
	const accent = useThemeColor("accent");
	const deleteMyAccount = useMutation(api.user.mutations.deleteMyAccount);

	const [busy, setBusy] = useState(false);

	const name = convexUser?.name ?? user?.username ?? user?.fullName ?? "Your";
	const email =
		user?.primaryEmailAddress?.emailAddress ?? convexUser?.email ?? "";
	const canChangePassword = user?.passwordEnabled ?? false;

	const handleSignOut = async () => {
		if (busy) return;
		setBusy(true);
		try {
			await signOut();
			router.replace("/(auth)");
		} catch {
			setBusy(false);
		}
	};

	const confirmSignOut = () => {
		Alert.alert("Log out?", "You'll need to sign in again.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Log out",
				style: "destructive",
				onPress: () => void handleSignOut(),
			},
		]);
	};

	const handleDeleteAccount = async () => {
		if (busy) return;
		setBusy(true);
		try {
			// Remove app data first, then the Clerk account, then bounce to auth.
			await deleteMyAccount({});
			await user?.delete();
			await signOut().catch(() => {});
			router.replace("/(auth)");
		} catch (err) {
			setBusy(false);
			Alert.alert(
				"Could not delete account",
				messageFromError(err, "Please try again."),
			);
		}
	};

	const confirmDeleteAccount = () => {
		if (busy) return;

		Alert.alert(
			"Delete account?",
			"Are you sure you want to permanently delete your account? All journals, entries, and uploaded media will be removed. This cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete account",
					style: "destructive",
					onPress: () => void handleDeleteAccount(),
				},
			],
			{ cancelable: true },
		);
	};

	const openLegal = (path: string) => {
		void WebBrowser.openBrowserAsync(nativeLegalUrl(path as any));
	};

	return (
		<View className="flex-1 bg-background">
			<View
				className="bg-primary px-5 pb-5"
				style={{ paddingTop: insets.top + 12 }}
			>
				<Text className="font-semibold text-2xl text-primary-foreground">
					{name}&apos;s Account
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerClassName="pt-2 pb-12"
				showsVerticalScrollIndicator={false}
			>
				<AccountRow
					title="Personal Details"
					subtitle={convexUser?.name ?? user?.username ?? undefined}
					onPress={() => router.push("/account/personal-details")}
					chevronColor={accent}
				/>
				<AccountRow
					title="Change Email"
					subtitle={email}
					onPress={() => router.push("/account/change-email")}
					chevronColor={accent}
				/>
				{canChangePassword ? (
					<AccountRow
						title="Change Password"
						subtitle="•••••••••••"
						onPress={() => router.push("/account/change-password")}
						chevronColor={accent}
					/>
				) : null}

				<View className="h-6 bg-secondary/20" />

				<AccountRow
					title="Log out"
					onPress={confirmSignOut}
					chevronColor={accent}
				/>

				<View className="items-center gap-6 px-6 pt-8">
					<Text className="text-center text-base text-foreground">
						<Text
							onPress={() => openLegal(nativeLegalRoutes.terms)}
							className="font-semibold underline"
						>
							Terms of Service
						</Text>
						<Text> and </Text>
						<Text
							onPress={() => openLegal(nativeLegalRoutes.privacy)}
							className="font-semibold underline"
						>
							Privacy Policy
						</Text>
					</Text>

					<Pressable
						onPress={() => confirmDeleteAccount()}
						disabled={busy}
						accessibilityRole="button"
						accessibilityLabel="Delete account"
						className="rounded-lg px-4 py-3 active:opacity-70 disabled:opacity-40"
						hitSlop={12}
					>
						<Text className="text-base text-muted-foreground">
							Delete Account
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}
