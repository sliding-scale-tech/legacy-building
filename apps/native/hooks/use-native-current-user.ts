import { useUser } from "@clerk/expo";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export function useNativeCurrentUser() {
	const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
	const convexUser = useQuery(
		api.user.queries.me,
		clerkLoaded && clerkUser ? {} : "skip",
	);

	const isLoading =
		!clerkLoaded || (Boolean(clerkUser) && convexUser === undefined);

	return {
		clerkUser,
		convexUser,
		isLoading,
		isSignedIn: clerkLoaded && Boolean(clerkUser),
		role:
			convexUser === undefined || convexUser === null ? null : convexUser.role,
	};
}
