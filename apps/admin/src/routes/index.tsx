import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { createFileRoute, Navigate } from "@tanstack/react-router";

import Loader from "@/components/loader";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/")({
	component: IndexRedirect,
});

function IndexRedirect() {
	const { isSignedIn, isLoading, role } = useCurrentUser();

	if (isLoading) {
		return <Loader />;
	}

	if (isSignedIn && role === "admin") {
		return <Navigate to={ROUTES.dashboard} replace />;
	}

	return <Navigate to={ROUTES.signIn} replace />;
}
