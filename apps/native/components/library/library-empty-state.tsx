import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native/hooks";
import { Pressable, Text, View } from "react-native";

type LibraryEmptyStateProps = {
	storyLabel: string;
	ctaLabel?: string;
	onPressCta?: () => void;
};

export function LibraryEmptyState({
	storyLabel,
	ctaLabel = "Create Journal",
	onPressCta,
}: LibraryEmptyStateProps) {
	const iconColor = useThemeColor("field-placeholder");

	return (
		<View className="items-center gap-4 rounded-2xl border border-border border-dashed bg-background px-6 py-10">
			<Ionicons name="book-outline" size={36} color={iconColor} />
			<Text className="font-semibold text-base text-foreground">
				No journals yet
			</Text>
			<Text className="text-center text-muted-foreground text-sm">
				{`Start your first ${storyLabel.toLowerCase()} journal to begin capturing your story.`}
			</Text>
			{onPressCta ? (
				<Pressable
					onPress={onPressCta}
					accessibilityRole="button"
					accessibilityLabel={ctaLabel}
					className="mt-1 h-12 min-w-[200px] items-center justify-center rounded-full bg-primary px-6 active:opacity-90"
				>
					<Text className="font-semibold text-base text-primary-foreground">
						{ctaLabel}
					</Text>
				</Pressable>
			) : null}
		</View>
	);
}
