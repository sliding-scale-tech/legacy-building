import { useSSO } from "@clerk/expo";
import googleLogo from "@legacy-building/assets/images/google logo.jpeg";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Image, Platform, Pressable, Text } from "react-native";

function useWarmUpBrowser() {
	useEffect(() => {
		if (Platform.OS === "android") {
			void WebBrowser.warmUpAsync();
			return () => {
				void WebBrowser.coolDownAsync();
			};
		}
	}, []);
}

WebBrowser.maybeCompleteAuthSession();

export function GoogleOAuthButton() {
	useWarmUpBrowser();
	const { startSSOFlow } = useSSO();
	const [pending, setPending] = useState(false);

	const handlePress = async () => {
		if (pending) return;
		setPending(true);

		try {
			const redirectUrl = Linking.createURL("/(tabs)");
			const { createdSessionId, setActive } = await startSSOFlow({
				strategy: "oauth_google",
				redirectUrl,
			});

			if (createdSessionId && setActive) {
				await setActive({ session: createdSessionId });
			}
		} catch (err: unknown) {
			const error = err as { code?: string };
			if (error?.code === "ERR_WEB_BROWSER_CANCELLED" || error?.code === "-5") {
				return;
			}
			console.error("Google OAuth error:", err);
		} finally {
			setPending(false);
		}
	};

	return (
		<Pressable
			className="h-12 flex-row items-center justify-center gap-2 rounded-full border border-border bg-popover px-4 active:opacity-70 disabled:opacity-50"
			onPress={() => void handlePress()}
			disabled={pending}
		>
			<Image
				source={googleLogo}
				className="h-8 w-8 rounded-full bg-background p-1 ring-1 ring-border"
				resizeMode="contain"
				accessibilityElementsHidden
				importantForAccessibility="no"
			/>
			<Text className="font-medium text-base text-foreground">
				{pending ? "Connecting…" : "Continue with Google"}
			</Text>
		</Pressable>
	);
}
