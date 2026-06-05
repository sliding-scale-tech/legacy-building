import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { ActivityIndicator, Image, Pressable, View } from "react-native";

type DeskProfileAvatarProps = {
	src: string;
	onPress?: () => void;
	busy?: boolean;
};

export function DeskProfileAvatar({
	src,
	onPress,
	busy = false,
}: DeskProfileAvatarProps) {
	const foreground = useThemeColor("foreground");

	return (
		<Pressable
			onPress={onPress}
			disabled={busy || !onPress}
			className="relative active:opacity-90"
			accessibilityRole="button"
			accessibilityLabel="Change profile photo"
		>
			<View className="size-40 overflow-hidden rounded-full border-4 border-primary bg-background sm:size-44">
				<Image
					source={{ uri: src }}
					className="size-full"
					resizeMode="cover"
					accessibilityLabel="Profile photo"
				/>
				{busy ? (
					<View className="absolute inset-0 items-center justify-center bg-black/40">
						<ActivityIndicator size="large" color="#ffffff" />
					</View>
				) : null}
			</View>
			<View className="absolute right-1 bottom-1 size-9 items-center justify-center rounded-full border-2 border-background bg-background">
				<Ionicons
					name={busy ? "cloud-upload" : "camera"}
					size={18}
					color={foreground}
				/>
			</View>
		</Pressable>
	);
}
