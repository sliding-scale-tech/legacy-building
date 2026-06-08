import { useThemeColor } from "heroui-native";
import { ActivityIndicator, Pressable, Text } from "react-native";

type AuthPrimaryButtonProps = {
	label: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
};

export function AuthPrimaryButton({
	label,
	onPress,
	disabled,
	loading,
}: AuthPrimaryButtonProps) {
	const accent = useThemeColor("accent");

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled || loading}
			className="mt-2 h-[52px] items-center justify-center rounded-full bg-white/90 shadow-md active:opacity-80 disabled:opacity-50"
			accessibilityRole="button"
		>
			{loading ? (
				<ActivityIndicator color={accent} />
			) : (
				<Text className="font-semibold text-[17px] text-primary">{label}</Text>
			)}
		</Pressable>
	);
}
