import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@legacy-building/backend/convex/_generated/api";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useQuery,
} from "convex/react";
import { Link } from "expo-router";
import { Button, Separator, Spinner, Surface } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { SignOutButton } from "@/components/sign-out-button";

export default function Home() {
	const { user } = useUser();
	const me = useQuery(api.user.queries.me);

	const isSignedIn = Boolean(user);
	const isLoading = me === undefined && isSignedIn;

	return (
		<Container className="px-4 pb-4">
			<View className="mb-5 py-6">
				<Text className="font-semibold text-3xl text-foreground tracking-tight">
					Legacy Building
				</Text>
				<Text className="mt-1 text-muted text-sm">
					Full-stack TypeScript starter
				</Text>
			</View>

			<Surface variant="secondary" className="rounded-xl p-4">
				<View className="mb-3 flex-row items-center justify-between">
					<Text className="font-medium text-foreground">Account</Text>
					{isLoading ? <Spinner size="sm" /> : null}
				</View>

				<Separator className="mb-3" />

				<Surface variant="tertiary" className="rounded-lg p-3">
					<View className="flex-row items-center">
						<View className="mr-3 h-2 w-2 rounded-full bg-success" />
						<View className="flex-1">
							<Text className="font-medium text-foreground text-sm">
								Convex Backend
							</Text>
							<Text className="mt-0.5 text-muted text-xs">
								{isLoading
									? "Loading account..."
									: me
										? `Signed in as ${me.name}`
										: isSignedIn
											? "Syncing account..."
											: "Sign in to sync your account"}
							</Text>
						</View>
						{me ? (
							<Ionicons name="checkmark-circle" size={18} color="#22c55e" />
						) : null}
					</View>
				</Surface>
			</Surface>

			<Authenticated>
				<Surface variant="secondary" className="mt-5 rounded-xl p-4">
					<View className="flex-row items-center justify-between">
						<View className="flex-1">
							<Text className="font-medium text-foreground">
								{user?.emailAddresses[0].emailAddress}
							</Text>
							{me ? (
								<Text className="mt-0.5 text-muted text-xs">
									Role: {me.role}
								</Text>
							) : null}
						</View>
						<SignOutButton />
					</View>
				</Surface>
			</Authenticated>
			<Unauthenticated>
				<View className="mt-4 gap-3">
					<Link href="/(auth)/sign-in" asChild>
						<Button variant="primary" className="w-full">
							<Button.Label>Sign In</Button.Label>
						</Button>
					</Link>
					<Link href="/(auth)/sign-up" asChild>
						<Button variant="tertiary">
							<Button.Label>Sign Up</Button.Label>
						</Button>
					</Link>
				</View>
			</Unauthenticated>
			<AuthLoading>
				<View className="mt-4 items-center">
					<Spinner size="sm" />
				</View>
			</AuthLoading>
		</Container>
	);
}
