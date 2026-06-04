import { useAuth, useUser } from "@clerk/react";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";

import Loader from "@/components/loader";
import { WelcomePage } from "@/features/welcome/WelcomePage";
import {
	messageFromUnknownError,
	toastMutationError,
} from "@/lib/journal/toast";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/welcome")({
	component: WelcomeRoute,
});

function WelcomeRoute() {
	const { isLoaded, isSignedIn } = useAuth();
	const { user: clerkUser } = useUser();
	const { convexUser, isLoading } = useCurrentUser();
	const navigate = useNavigate();
	const completeWelcome = useMutation(api.user.mutations.completeWelcome);
	const [submitting, setSubmitting] = useState(false);

	if (!isLoaded || isLoading) {
		return <Loader />;
	}

	if (!isSignedIn) {
		return <Navigate to={ROUTES.login} replace />;
	}

	if (convexUser?.welcomeCompletedAt) {
		return <Navigate to={ROUTES.dashboardDesk} replace />;
	}

	const userName =
		convexUser?.name?.trim() ||
		clerkUser?.fullName?.trim() ||
		clerkUser?.firstName?.trim() ||
		convexUser?.email?.split("@")[0] ||
		"there";

	const handleHomepage = async () => {
		setSubmitting(true);
		try {
			await completeWelcome({});
			void navigate({
				to: ROUTES.dashboardDesk,
				replace: true,
				state: { skeleton: true },
			});
		} catch (err) {
			toastMutationError(
				err,
				messageFromUnknownError(err, "Could not continue. Please try again."),
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<WelcomePage
			userName={userName}
			onHomepage={() => void handleHomepage()}
			loading={submitting}
		/>
	);
}
