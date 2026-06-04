import { useAuth } from "@clerk/react";
import { createFileRoute, Navigate } from "@tanstack/react-router";

import Loader from "@/components/loader";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/")({
	component: RootRedirect,
});

function RootRedirect() {
	const { isLoaded, isSignedIn } = useAuth();

	if (!isLoaded) {
		return <Loader />;
	}

	if (isSignedIn) {
		return <Navigate to={ROUTES.dashboardDesk} replace />;
	}

	return <Navigate to={ROUTES.login} replace />;
}
