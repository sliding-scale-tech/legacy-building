import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { Navigate, useRouterState } from "@tanstack/react-router";

import Loader from "@/components/loader";
import { ROUTES } from "@/lib/routes";

type WelcomeGuardProps = {
	children: React.ReactNode;
};

/** First-time users must watch the welcome video before accessing the dashboard. */
export function WelcomeGuard({ children }: WelcomeGuardProps) {
	const { convexUser, isLoading } = useCurrentUser();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	if (isLoading) {
		return <Loader />;
	}

	const needsWelcome = convexUser && !convexUser.welcomeCompletedAt;

	if (needsWelcome && pathname !== ROUTES.welcome) {
		return <Navigate to={ROUTES.welcome} replace />;
	}

	return children;
}
