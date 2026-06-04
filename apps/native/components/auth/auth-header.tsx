import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthHeaderProps = {
	title: string;
	/** Label beside chevron; defaults to "Back". */
	backLabel?: string;
	/** When set, replaces instead of going back. */
	backHref?: Href;
};

export function AuthHeader({
	title,
	backLabel = "Back",
	backHref,
}: AuthHeaderProps) {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const foreground = useThemeColor("foreground");

	const onBack = () => {
		if (backHref) {
			router.replace(backHref);
			return;
		}
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/(auth)");
	};

	return (
		<View
			className="flex-row items-center border-border border-b bg-background px-3 pb-3"
			style={{ paddingTop: insets.top + 8 }}
		>
			<Pressable
				onPress={onBack}
				className="min-w-[88px] flex-row items-center gap-0.5 active:opacity-60"
				accessibilityRole="button"
				accessibilityLabel={backLabel}
			>
				<Ionicons name="chevron-back" size={22} color={foreground} />
				<Text className="text-[17px] text-foreground">{backLabel}</Text>
			</Pressable>

			<Text
				className="flex-1 text-center font-semibold text-[17px] text-foreground"
				numberOfLines={1}
			>
				{title}
			</Text>

			{/* spacer mirrors the back button width so title stays centred */}
			<View className="min-w-[88px]" />
		</View>
	);
}
