import { Skeleton } from "@legacy-building/ui/components/skeleton";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { Navigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AdminForbidden } from "@/components/admin-forbidden";
import { ADMIN_AUTH_ROUTE_PREFIXES } from "@/lib/nav";
import { ROUTES } from "@/lib/routes";

type Props = {
	children: ReactNode;
};

function isAuthRoute(pathname: string) {
	return ADMIN_AUTH_ROUTE_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}

function GateSkeleton() {
	return (
		<div
			className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-4 px-6"
			aria-busy="true"
		>
			<Skeleton className="h-8 w-48 rounded-md" />
			<Skeleton className="h-4 w-64 rounded-md" />
		</div>
	);
}

/** Blocks non-admin signed-in users from protected admin routes (403 UI). */
export function AdminRouteGate({ children }: Props) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { isSignedIn, isLoading, role } = useCurrentUser();
	const onAuthRoute = isAuthRoute(pathname);

	if (onAuthRoute) {
		return children;
	}

	if (isLoading) {
		return <GateSkeleton />;
	}

	if (!isSignedIn) {
		return <Navigate to={ROUTES.signIn} replace />;
	}

	if (role !== "admin") {
		return <AdminForbidden />;
	}

	return children;
}
