import { UserButton, useUser } from "@clerk/react";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { buttonVariants } from "@legacy-building/ui/components/button";
import { Skeleton } from "@legacy-building/ui/components/skeleton";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { cn } from "@legacy-building/ui/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useQuery,
} from "convex/react";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Authenticated>
				<DashboardContent />
			</Authenticated>
			<Unauthenticated>
				<div className="flex min-h-[50svh] flex-col items-center justify-center gap-4 px-4">
					<h1 className="font-semibold text-2xl">Sign in required</h1>
					<p className="text-center text-muted-foreground text-sm">
						You need to sign in to view your dashboard.
					</p>
					<Link to="/login" className={cn(buttonVariants())}>
						Sign in
					</Link>
				</div>
			</Unauthenticated>
			<AuthLoading>
				<div className="container mx-auto max-w-3xl px-4 py-8">
					<Skeleton className="mb-4 h-8 w-48" />
					<Skeleton className="h-24 w-full" />
				</div>
			</AuthLoading>
		</>
	);
}

function DashboardContent() {
	const { user } = useUser();
	const { convexUser, isLoading } = useCurrentUser();
	const subscriptions = useQuery(api.stripe.getUserSubscriptions);

	return (
		<div className="container mx-auto max-w-3xl px-4 py-8">
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<h1 className="font-semibold text-2xl">Dashboard</h1>
					<p className="text-muted-foreground text-sm">
						Welcome {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
					</p>
				</div>
				<UserButton />
			</div>

			{isLoading ? (
				<div className="space-y-3">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
			) : convexUser ? (
				<section className="rounded-lg border border-border p-4">
					<h2 className="mb-2 font-medium">Your account</h2>
					<p className="text-muted-foreground text-sm">
						Role: {convexUser.role}
					</p>
					<p className="text-muted-foreground text-sm">
						Subscriptions: {subscriptions?.length ?? 0}
					</p>
				</section>
			) : (
				<p className="text-muted-foreground text-sm">
					Your account is syncing. Refresh in a moment.
				</p>
			)}
		</div>
	);
}
