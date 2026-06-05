import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";

/** Root entry — route once after auth loads (no <Redirect> render loops). */
export default function Index() {
	const { isLoaded, isSignedIn } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoaded) return;
		router.replace(isSignedIn ? "/(tabs)" : "/(auth)");
	}, [isLoaded, isSignedIn, router]);

	return null;
}
