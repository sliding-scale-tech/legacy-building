import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AccountScreenHeaderProps = {
	title: string;
};

/** Teal header with a back arrow + centered-left title for account sub-screens. */
export function AccountScreenHeader({ title }: AccountScreenHeaderProps) {
	const insets = useSafeAreaInsets();
	const accentForeground = useThemeColor("accent-foreground");

	return (
		<View
			className="bg-primary px-3 pb-3"
			style={{ paddingTop: insets.top + 6 }}
		>
			<View className="h-11 flex-row items-center gap-2">
				<Pressable
					onPress={() => router.back()}
					accessibilityRole="button"
					accessibilityLabel="Back"
					className="size-10 items-center justify-center rounded-full active:opacity-70"
					hitSlop={6}
				>
					<Ionicons name="arrow-back" size={24} color={accentForeground} />
				</Pressable>
				<Text className="font-semibold text-primary-foreground text-xl">
					{title}
				</Text>
			</View>
		</View>
	);
}
