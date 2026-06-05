import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native/hooks";
import { Pressable, Text, View } from "react-native";

import { formatDateLong } from "@/lib/journal/formatDate";

type JournalEntryRowProps = {
	title: string;
	dateMs: number;
	mode?: "writing" | "recording";
	onPress?: () => void;
};

/**
 * Row used inside the journal detail list. White card with the entry title and
 * date on the left, and a teal half-circle on the right with a book (writing)
 * or microphone (recording) icon.
 */
export function JournalEntryRow({
	title,
	dateMs,
	mode = "writing",
	onPress,
}: JournalEntryRowProps) {
	const [accentForeground, foreground] = useThemeColor([
		"accent-foreground",
		"foreground",
	]);

	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={`Open entry ${title}`}
			className="relative overflow-hidden rounded-2xl bg-background pl-4 active:scale-[0.98] active:opacity-90"
			style={{
				shadowColor: foreground,
				shadowOpacity: 0.06,
				shadowRadius: 6,
				shadowOffset: { width: 0, height: 1 },
				elevation: 1,
			}}
		>
			<View className="flex-row items-stretch">
				<View className="flex-1 py-4 pr-3">
					<Text
						className="font-semibold text-base text-foreground"
						numberOfLines={1}
					>
						{title}
					</Text>
					<Text className="mt-0.5 text-muted-foreground text-sm">
						{formatDateLong(dateMs)}
					</Text>
				</View>

				<View
					className="w-20 items-center justify-center bg-accent"
					style={{
						borderTopLeftRadius: 999,
						borderBottomLeftRadius: 999,
					}}
				>
					<Ionicons
						name={mode === "recording" ? "mic" : "book"}
						size={24}
						color={accentForeground}
					/>
				</View>
			</View>
		</Pressable>
	);
}
