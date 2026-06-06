import { api } from "@legacy-building/backend/convex/_generated/api";
import { PageLoader } from "@legacy-building/ui/components/page-loader";
import { Navigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { ROUTES } from "@/lib/routes";

type SubscriptionGuardProps = {
	children: React.ReactNode;
};

function isBillingPath(pathname: string) {
	return (
		pathname === ROUTES.dashboardBilling ||
		pathname.startsWith(`${ROUTES.dashboardBilling}/`)
	);
}

/** Blocks Desk/Library until the user has a paid (non-trial) subscription. */
export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const hasPaidAccess = useQuery(api.stripe.queries.hasPaidFeatureAccess);

	if (isBillingPath(pathname) || pathname === ROUTES.dashboardAccount) {
		return children;
	}

	if (hasPaidAccess === undefined) {
		return <PageLoader />;
	}

	if (!hasPaidAccess) {
		return (
			<Navigate
				to={ROUTES.dashboardBilling}
				search={{ subscribe: "required" }}
				replace
			/>
		);
	}

	return children;
}
