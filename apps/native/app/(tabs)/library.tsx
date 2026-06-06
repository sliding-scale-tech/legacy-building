import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LibraryScreen() {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 items-center justify-center bg-background px-6"
			style={{ paddingTop: insets.top }}
		>
			<Text className="font-semibold text-foreground text-xl">Library</Text>
			<Text className="mt-2 text-center text-muted-foreground text-sm">
				Your journals will appear here soon.
			</Text>
		</View>
	);
}
