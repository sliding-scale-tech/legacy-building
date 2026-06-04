import { legalRoutes } from "@legacy-building/ui/lib/brand-journal";
import * as WebBrowser from "expo-web-browser";
import { Pressable, Text, View } from "react-native";
import { nativeLegalUrl } from "@/lib/native-legal-url";

type SignupTermsRowProps = {
	checked: boolean;
	onToggle: () => void;
	error?: string;
};

export function SignupTermsRow({
	checked,
	onToggle,
	error,
}: SignupTermsRowProps) {
	return (
		<View className="gap-1.5">
			<Pressable
				onPress={onToggle}
				className="flex-row items-start gap-2.5"
				accessibilityRole="checkbox"
				accessibilityState={{ checked }}
			>
				<View
					className={`mt-0.5 h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
						checked ? "border-white bg-white" : "border-white"
					}`}
				>
					{checked ? (
						<Text className="font-bold text-primary text-xs">✓</Text>
					) : null}
				</View>

				<Text className="flex-1 text-primary-foreground text-sm leading-5">
					By signing up you agree to our{" "}
					<Text
						className="font-semibold text-primary-foreground underline"
						onPress={() =>
							void WebBrowser.openBrowserAsync(
								nativeLegalUrl(legalRoutes.terms),
							)
						}
					>
						Terms of Service
					</Text>{" "}
					and{" "}
					<Text
						className="font-semibold text-primary-foreground underline"
						onPress={() =>
							void WebBrowser.openBrowserAsync(
								nativeLegalUrl(legalRoutes.privacy),
							)
						}
					>
						Privacy Policy
					</Text>
					.
				</Text>
			</Pressable>
			{error ? <Text className="text-red-300 text-xs">{error}</Text> : null}
		</View>
	);
}
