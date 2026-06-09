import { useAuth } from "@clerk/expo";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";

export default function TabLayout() {
	const { isLoaded, isSignedIn } = useAuth();
	const router = useRouter();
	const didRedirect = useRef(false);
	useEffect(() => {
		if (!isLoaded || isSignedIn) {
			didRedirect.current = false;
			return;
		}
		if (didRedirect.current) return;
		didRedirect.current = true;
		router.replace("/(auth)");
	}, [isLoaded, isSignedIn, router]);

	const screenOptions = useMemo(
		() => ({
			headerShown: false as const,
			tabBarStyle: { display: "none" as const },
		}),
		[],
	);

	if (!isLoaded || !isSignedIn) {
		return null;
	}

	return (
		<Tabs screenOptions={screenOptions}>
			<Tabs.Screen name="index" options={{ title: "Desk" }} />
			<Tabs.Screen name="library" options={{ title: "Library" }} />
			<Tabs.Screen name="account" options={{ title: "Account" }} />
		</Tabs>
	);
}
