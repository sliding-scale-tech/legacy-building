import "@/global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { env } from "@legacy-building/env/native";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { NativeAppProviders } from "@/components/native-app-providers";
import { AppThemeProvider } from "@/contexts/app-theme-context";

export const unstable_settings = {
	initialRouteName: "index",
};

const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
	unsavedChangesWarning: false,
});

function StackLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="(auth)" />
			<Stack.Screen
				name="journal/create"
				options={{ presentation: "modal", headerShown: false }}
			/>
			<Stack.Screen
				name="journal/[journalId]/index"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="journal/[journalId]/new-entry"
				options={{ presentation: "modal", headerShown: false }}
			/>
			<Stack.Screen
				name="journal/entry/[entryId]"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="modal"
				options={{ title: "Modal", presentation: "modal", headerShown: true }}
			/>
		</Stack>
	);
}

export default function Layout() {
	return (
		<ClerkProvider
			tokenCache={tokenCache}
			publishableKey={env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
		>
			<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<KeyboardProvider>
						<AppThemeProvider>
							<HeroUINativeProvider>
								<NativeAppProviders>
									<StackLayout />
								</NativeAppProviders>
							</HeroUINativeProvider>
						</AppThemeProvider>
					</KeyboardProvider>
				</GestureHandlerRootView>
			</ConvexProviderWithClerk>
		</ClerkProvider>
	);
}
