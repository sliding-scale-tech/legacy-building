import { useUser } from "@clerk/react";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { Button } from "@legacy-building/ui/components/button";
import { PageLoader } from "@legacy-building/ui/components/page-loader";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

type DashboardUserGateProps = {
	children: React.ReactNode;
};

const CONNECTION_TIMEOUT_MS = 20_000;

function preferredNameFromClerkUser(
	user: ReturnType<typeof useUser>["user"],
): string | undefined {
	const clerkUsername = user?.username?.trim();
	if (clerkUsername && clerkUsername.length >= 2) {
		return clerkUsername;
	}
	const legacy = user?.unsafeMetadata?.displayName;
	if (typeof legacy === "string") {
		const trimmed = legacy.trim();
		if (trimmed.length >= 2) return trimmed;
	}
	return undefined;
}

export function DashboardUserGate({ children }: DashboardUserGateProps) {
	const { user } = useUser();
	const { convexUser, isLoading, isSignedIn } = useCurrentUser();
	const ensureCurrentUser = useMutation(api.user.mutations.ensureCurrentUser);

	const [timedOut, setTimedOut] = useState(false);
	const [setupError, setSetupError] = useState<string | null>(null);
	const [ensuring, setEnsuring] = useState(false);
	const ensureAttempted = useRef(false);

	useEffect(() => {
		if (!isLoading) {
			setTimedOut(false);
			return;
		}
		const timer = window.setTimeout(
			() => setTimedOut(true),
			CONNECTION_TIMEOUT_MS,
		);
		return () => window.clearTimeout(timer);
	}, [isLoading]);

	useEffect(() => {
		if (isLoading || !isSignedIn || convexUser !== null) {
			return;
		}
		if (ensureAttempted.current) {
			return;
		}
		ensureAttempted.current = true;
		setEnsuring(true);
		setSetupError(null);

		ensureCurrentUser({
			preferredName: preferredNameFromClerkUser(user),
		})
			.catch((err) => {
				ensureAttempted.current = false;
				const message =
					err instanceof Error
						? err.message
						: "Could not finish setting up your account.";
				setSetupError(message);
			})
			.finally(() => {
				setEnsuring(false);
			});
	}, [convexUser, ensureCurrentUser, isLoading, isSignedIn, user]);

	const retrySetup = () => {
		ensureAttempted.current = false;
		setSetupError(null);
		setTimedOut(false);
	};

	if (isLoading || ensuring) {
		return (
			<PageLoader
				size={240}
				message={
					ensuring
						? "Setting up your account…"
						: "Connecting to your workspace…"
				}
			/>
		);
	}

	if (timedOut && convexUser === undefined) {
		return (
			<DashboardGateShell>
				<p className="font-heading font-semibold text-[#1a1a1a] text-lg">
					Connection problem
				</p>
				<p className="mt-2 max-w-sm text-[#525252] text-sm leading-relaxed">
					We couldn&apos;t reach the server. Check your internet connection and
					refresh the page. If this continues, contact support.
				</p>
				<Button
					type="button"
					className="mt-6 h-11 rounded-xl bg-[#008080] px-6 text-white hover:bg-[#006b6b]"
					onClick={() => window.location.reload()}
				>
					Refresh
				</Button>
			</DashboardGateShell>
		);
	}

	if (setupError) {
		return (
			<DashboardGateShell>
				<p className="font-heading font-semibold text-[#1a1a1a] text-lg">
					Account setup failed
				</p>
				<p className="mt-2 max-w-sm text-[#525252] text-sm leading-relaxed">
					{setupError}
				</p>
				<Button
					type="button"
					className="mt-6 h-11 rounded-xl bg-[#008080] px-6 text-white hover:bg-[#006b6b]"
					onClick={retrySetup}
				>
					Try again
				</Button>
			</DashboardGateShell>
		);
	}

	if (isSignedIn && convexUser === null) {
		return <PageLoader size={240} message="Preparing your account…" />;
	}

	return children;
}

function DashboardGateShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-svh w-full flex-col items-center justify-center bg-white px-6 py-12">
			<div className="flex max-w-md flex-col items-center text-center">
				{children}
			</div>
		</div>
	);
}
