import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

/** Root entry — send users to Desk (signed in) or auth (signed out). */
export default function Index() {
	const { isLoaded, isSignedIn } = useAuth();

	if (!isLoaded) {
		return null;
	}

	if (isSignedIn) {
		return <Redirect href="/(tabs)" />;
	}

	return <Redirect href="/(auth)" />;
}
