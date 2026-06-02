"use client";

import { useUser } from "@clerk/react";
import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Doc } from "@legacy-building/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

export type ConvexCurrentUser = FunctionReturnType<typeof api.user.queries.me>;

export type CurrentUser = {
	clerkUser: ReturnType<typeof useUser>["user"];
	role: Doc<"users">["role"] | null;
	convexUser: ConvexCurrentUser | undefined;
	isLoading: boolean;
	isSignedIn: boolean;
};

export function useCurrentUser(): CurrentUser {
	const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

	const convexUser = useQuery(
		api.user.queries.me,
		clerkLoaded && clerkUser ? {} : "skip",
	);

	const isLoading =
		!clerkLoaded || (Boolean(clerkUser) && convexUser === undefined);

	const role =
		convexUser === undefined || convexUser === null ? null : convexUser.role;

	return {
		clerkUser,
		role,
		convexUser,
		isLoading,
		isSignedIn: clerkLoaded && Boolean(clerkUser),
	};
}
