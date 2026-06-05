import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { Text, View } from "react-native";

type LibraryEmptyStateProps = {
	storyLabel: string;
};

export function LibraryEmptyState({ storyLabel }: LibraryEmptyStateProps) {
	const muted = useThemeColor("muted-foreground");

	return (
		<View className="items-center gap-3 rounded-2xl border border-border border-dashed bg-background px-6 py-10">
			<Ionicons name="book-outline" size={36} color={muted} />
			<Text className="font-semibold text-base text-foreground">
				No journals yet
			</Text>
			<Text className="text-center text-muted-foreground text-sm">
				{`Start your first ${storyLabel.toLowerCase()} journal — tap Create Journal below.`}
			</Text>
		</View>
	);
}
