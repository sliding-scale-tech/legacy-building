import { useAuth } from "@clerk/react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/signup")({
	component: SignUpPage,
	validateSearch: (search: Record<string, unknown>) => ({
		type: typeof search.type === "string" ? search.type : undefined,
	}),
});

function SignUpPage() {
	const { isLoaded, isSignedIn } = useAuth();
	const { type } = Route.useSearch();
	const signInHref = type
		? `/login?type=${encodeURIComponent(type)}`
		: ROUTES.login;

	if (isLoaded && isSignedIn) {
		return <Navigate to={ROUTES.dashboard} replace />;
	}

	if (!isLoaded) {
		return (
			<div
				className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background"
				aria-busy="true"
				aria-live="polite"
			>
				<div
					className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
					aria-hidden
				/>
				<p className="text-muted-foreground text-sm">Loading sign up...</p>
			</div>
		);
	}

	return (
		<AuthLayout>
			<div className="flex flex-col gap-1">
				<h1 className="font-bold font-heading text-[1.75rem] text-foreground leading-tight tracking-tight">
					Create an Account
				</h1>
				<p className="text-muted-foreground text-sm">
					Create your account to start writing your story.
				</p>
			</div>
			<div className="mt-6 flex flex-col gap-4">
				<SignUpForm signupType={type} />
				<p className="text-center text-muted-foreground text-sm">
					Already have an Account?{" "}
					<Link
						to={signInHref}
						className="font-semibold text-primary hover:opacity-80"
					>
						Login
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
}
