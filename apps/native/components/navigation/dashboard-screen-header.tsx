import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MobileNavMenu } from "@/components/navigation/mobile-nav-menu";

type DashboardScreenHeaderProps = {
	title: string;
	avatarUrl: string;
};

export function DashboardScreenHeader({
	title,
	avatarUrl,
}: DashboardScreenHeaderProps) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="bg-primary px-4 pb-4"
			style={{ paddingTop: insets.top + 12 }}
		>
			<View className="min-h-11 flex-row items-center">
				<View className="size-11" />
				<Text
					className="flex-1 text-center font-semibold text-lg text-primary-foreground"
					numberOfLines={1}
				>
					{title}
				</Text>
				<MobileNavMenu avatarUrl={avatarUrl} />
			</View>
		</View>
	);
}
