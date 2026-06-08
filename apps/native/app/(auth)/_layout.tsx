import { useAuth } from "@clerk/expo";
import { Stack } from "expo-router";

/** Auth screens only — no redirects here (avoids ping-pong with the tabs layout). */
export default function AuthRoutesLayout() {
	const { isLoaded } = useAuth();

	if (!isLoaded) {
		return null;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "slide_from_right",
				contentStyle: { backgroundColor: "transparent" },
			}}
		/>
	);
}
