import { useAuth } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { AuthScreen } from "@/components/auth/auth-screen";
import { nativeAssets } from "@/lib/assets";

export default function AuthHomePage() {
	const router = useRouter();
	const { isLoaded, isSignedIn } = useAuth();

	useEffect(() => {
		if (!isLoaded || !isSignedIn) return;
		router.replace("/(tabs)");
	}, [isLoaded, isSignedIn, router]);

	if (!isLoaded || isSignedIn) {
		return null;
	}

	return (
		<AuthScreen scroll={false}>
			<View className="items-center gap-7">
				<Image
					source={{ uri: nativeAssets.whiteLogo }}
					className="h-[120px] w-[280px]"
					resizeMode="contain"
					accessibilityLabel="Legacy Building"
				/>

				<Text className="font-medium text-[22px] text-primary-foreground tracking-wide">
					Write Your Story
				</Text>

				<View className="mt-3 w-full gap-5">
					<AuthPrimaryButton
						label="Sign Up"
						onPress={() => router.push("/sign-up" as Href)}
					/>
					<View className="flex-row flex-wrap justify-center">
						<Text className="text-[15px] text-primary-foreground">
							Already have an account?{"  "}
						</Text>
						<Link href={"/sign-in" as Href} asChild>
							<Pressable accessibilityRole="link" className="active:opacity-60">
								<Text className="font-semibold text-[15px] text-primary-foreground underline">
									Log in
								</Text>
							</Pressable>
						</Link>
					</View>
				</View>
			</View>
		</AuthScreen>
	);
}
