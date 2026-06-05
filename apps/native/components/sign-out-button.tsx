import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

export function SignOutButton() {
	const { signOut } = useClerk();
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			await signOut();
			router.replace("/(auth)");
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
		}
	};

	return (
		<Pressable
			onPress={() => void handleSignOut()}
			className="rounded-full border border-border px-5 py-3 active:opacity-70"
		>
			<Text className="text-center font-semibold text-foreground">
				Sign out
			</Text>
		</Pressable>
	);
}
