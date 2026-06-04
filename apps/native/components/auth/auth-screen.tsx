import { assets } from "@legacy-building/ui/lib/brand-journal";
import type { ReactNode } from "react";
import {
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthScreenProps = {
	children: ReactNode;
	header?: ReactNode;
	/** When false, content is centered vertically (landing page). */
	scroll?: boolean;
};

export function AuthScreen({
	children,
	header,
	scroll = true,
}: AuthScreenProps) {
	const insets = useSafeAreaInsets();

	const body = scroll ? (
		<ScrollView
			className="flex-1"
			contentContainerClassName="grow px-6 pt-6 pb-8"
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
		>
			{children}
		</ScrollView>
	) : (
		<View className="flex-1 justify-center px-7">{children}</View>
	);

	return (
		<View className="flex-1 bg-primary">
			<ImageBackground
				source={{ uri: assets.authPanelBackground }}
				style={StyleSheet.absoluteFill}
				resizeMode="cover"
			>
				<View className="absolute inset-0 bg-primary/70" />
			</ImageBackground>

			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<View
					className="flex-1"
					style={{
						paddingTop: header ? 0 : insets.top,
						paddingBottom: insets.bottom,
					}}
				>
					{header}
					{body}
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}
