import { useAuth } from "@clerk/react";
import { APP_NAME } from "@legacy-building/ui/lib/brand";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const { isLoaded, isSignedIn } = useAuth();
	const [forgotOpen, setForgotOpen] = useState(false);
	const signUpHref = ROUTES.signup;

	if (isLoaded && isSignedIn) {
		return <Navigate to={ROUTES.dashboard} replace />;
	}

	if (!isLoaded) {
		return (
			<div
				className="flex min-h-svh flex-col items-center justify-center gap-4"
				aria-busy="true"
				aria-live="polite"
			>
				<div
					className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
					aria-hidden
				/>
				<p className="text-muted-foreground text-sm">Loading sign in...</p>
			</div>
		);
	}

	return (
		<div className="relative flex min-h-svh flex-col bg-background text-foreground">
			<div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
				<div className="w-full max-w-md">
					<header className="mb-8 flex shrink-0 items-center">
						<span className="font-heading font-semibold text-foreground text-lg tracking-tight">
							{APP_NAME}
						</span>
					</header>

					<main className="flex w-full flex-col">
						<h1 className="font-heading font-semibold text-4xl text-foreground leading-tight tracking-tight sm:text-[2.5rem]">
							Welcome back.
						</h1>
						<p className="mt-3 text-base text-muted-foreground leading-relaxed">
							Sign in to continue to your account.
						</p>
						<div className="mt-8 flex flex-col gap-6">
							<SignInForm
								signUpHref={signUpHref}
								forgotOpen={forgotOpen}
								setForgotOpen={setForgotOpen}
							/>
							{!forgotOpen ? (
								<>
									<div className="relative py-1">
										<div
											className="absolute inset-0 flex items-center"
											aria-hidden
										>
											<span className="w-full border-border border-t" />
										</div>
										<div className="relative flex justify-center font-medium text-muted-foreground text-xs uppercase tracking-[0.14em]">
											<span className="bg-background px-3">Or</span>
										</div>
									</div>
									<GoogleOAuthButton mode="sign-in" />
									<p className="text-center text-muted-foreground text-sm">
										Don&apos;t have an account?{" "}
										<Link
											to={signUpHref}
											search={{ type: undefined }}
											className="font-semibold text-foreground underline underline-offset-4 hover:text-foreground/80"
										>
											Sign up
										</Link>
									</p>
								</>
							) : null}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}
