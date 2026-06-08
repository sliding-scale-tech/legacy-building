import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SignOutButton } from "@/components/sign-out-button";
import { useNativeCurrentUser } from "@/hooks/use-native-current-user";

export default function AccountScreen() {
	const insets = useSafeAreaInsets();
	const { convexUser } = useNativeCurrentUser();

	return (
		<View
			className="flex-1 bg-background px-6"
			style={{ paddingTop: insets.top + 24 }}
		>
			<Text className="font-semibold text-2xl text-foreground">Account</Text>
			{convexUser ? (
				<View className="mt-6 gap-1">
					<Text className="font-medium text-foreground">{convexUser.name}</Text>
					<Text className="text-muted-foreground text-sm">
						{convexUser.email}
					</Text>
				</View>
			) : null}
			<View className="mt-8">
				<SignOutButton />
			</View>
		</View>
	);
}
