import { PageLoader } from "@legacy-building/ui/components/page-loader";
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

/** Blocks non-admin signed-in users from protected admin routes (403 UI). */
export function AdminRouteGate({ children }: Props) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { isSignedIn, isLoading, role } = useCurrentUser();
	const onAuthRoute = isAuthRoute(pathname);

	if (onAuthRoute) {
		return children;
	}

	if (isLoading) {
		return <PageLoader />;
	}

	if (!isSignedIn) {
		return <Navigate to={ROUTES.signIn} replace />;
	}

	if (role !== "admin") {
		return <AdminForbidden />;
	}

	return children;
}
