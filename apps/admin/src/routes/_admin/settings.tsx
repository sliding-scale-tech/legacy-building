import { PasswordChangeForm } from "@legacy-building/ui/components/password-change-form";
import { Skeleton } from "@legacy-building/ui/components/skeleton";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

import { adminCardClass, adminContainerClass } from "@/lib/admin-theme";

export const Route = createFileRoute("/_admin/settings")({
	component: SettingsPage,
});

function SettingsSkeleton() {
	return (
		<div className="fade-in-50 animate-in space-y-6 duration-300">
			<Skeleton className="h-9 w-32 rounded-md" />
			<Skeleton className="h-48 w-full rounded-xl" />
		</div>
	);
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className={`${adminCardClass} p-5 sm:p-6`}>
			<header className="mb-4">
				<h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
					{title}
				</h2>
				{description ? (
					<p className="mt-1 text-muted-foreground text-sm">{description}</p>
				) : null}
			</header>
			{children}
		</section>
	);
}

function SettingsPage() {
	const { convexUser, isLoading } = useCurrentUser();
	const email = convexUser?.email ?? "";

	return (
		<div className={`${adminContainerClass} max-w-3xl`}>
			<Authenticated>
				{isLoading || !convexUser ? (
					<SettingsSkeleton />
				) : (
					<div className="fade-in-50 slide-in-from-bottom-2 animate-in space-y-6 duration-300">
						<header>
							<h1 className="font-heading font-semibold text-2xl tracking-tight">
								Settings
							</h1>
							<p className="mt-1 text-muted-foreground text-sm">{email}</p>
						</header>

						<Section
							title="Password"
							description="Update your sign-in password."
						>
							<PasswordChangeForm />
						</Section>
					</div>
				)}
			</Authenticated>

			<Unauthenticated>
				<div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6">
					<h2 className="font-heading font-semibold text-lg tracking-tight">
						You&apos;re signed out
					</h2>
					<p className="text-muted-foreground text-sm">
						Sign in to view settings.
					</p>
				</div>
			</Unauthenticated>

			<AuthLoading>
				<SettingsSkeleton />
			</AuthLoading>
		</div>
	);
}
