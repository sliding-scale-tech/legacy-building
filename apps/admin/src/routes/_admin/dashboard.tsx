import { UserButton, useUser } from "@clerk/react";
import { Skeleton } from "@mobile-starter/ui/components/skeleton";
import { useCurrentUser } from "@mobile-starter/ui/hooks/use-current-user";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export const Route = createFileRoute("/_admin/dashboard")({
	component: DashboardPage,
});

function DashboardSkeleton() {
	return (
		<div className="fade-in-50 animate-in space-y-3 duration-300">
			<Skeleton className="h-7 w-40 rounded-md" />
			<Skeleton className="h-4 w-56 rounded-md" />
			<Skeleton className="h-4 w-72 rounded-md" />
		</div>
	);
}

function DashboardPage() {
	const user = useUser();
	const { convexUser, isLoading } = useCurrentUser();

	return (
		<div className="mx-auto w-full max-w-3xl p-6 sm:p-8">
			<Authenticated>
				{isLoading || !convexUser ? (
					<DashboardSkeleton />
				) : (
					<div className="fade-in-50 slide-in-from-bottom-2 animate-in space-y-2 duration-300">
						<div className="flex items-center justify-between gap-4">
							<h1 className="font-heading font-semibold text-2xl tracking-tight">
								Dashboard
							</h1>
							<UserButton />
						</div>
						<p className="text-muted-foreground text-sm sm:text-base">
							Welcome{" "}
							{user.user?.fullName ??
								user.user?.primaryEmailAddress?.emailAddress}
						</p>
						<div className="mt-6 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm sm:p-5">
							<p className="text-muted-foreground text-sm">Admin account</p>
							<p className="mt-1 font-medium">{convexUser.email}</p>
							<p className="mt-1 text-muted-foreground text-sm">
								Role: {convexUser.role}
							</p>
						</div>
					</div>
				)}
			</Authenticated>
			<Unauthenticated>
				<div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6">
					<h2 className="font-heading font-semibold text-lg tracking-tight">
						You&apos;re signed out
					</h2>
					<p className="text-muted-foreground text-sm">Sign in to continue.</p>
				</div>
			</Unauthenticated>
			<AuthLoading>
				<DashboardSkeleton />
			</AuthLoading>
		</div>
	);
}
