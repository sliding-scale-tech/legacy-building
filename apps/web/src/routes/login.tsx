import { useAuth } from "@clerk/react";
import { PageLoader } from "@legacy-building/ui/components/page-loader";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthLayout } from "@/components/auth/auth-layout";
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
		return <PageLoader message="Loading sign in..." />;
	}

	return (
		<AuthLayout>
			<div className="flex flex-col gap-2 text-center lg:text-left">
				<h1 className="font-bold font-heading text-2xl text-foreground leading-tight tracking-tight sm:text-3xl lg:text-[2rem]">
					Log in to your account
				</h1>
				<p className="text-muted-foreground text-sm sm:text-base">
					Welcome back! Continue writing your story.
				</p>
			</div>
			<div className="mt-6 flex flex-col gap-5 sm:mt-8">
				<SignInForm
					signUpHref={signUpHref}
					forgotOpen={forgotOpen}
					setForgotOpen={setForgotOpen}
				/>
				{!forgotOpen ? (
					<>
						<div className="relative py-1">
							<div className="absolute inset-0 flex items-center" aria-hidden>
								<span className="w-full border-border border-t" />
							</div>
							<div className="relative flex justify-center font-medium text-muted-foreground text-xs uppercase tracking-[0.14em]">
								<span className="bg-transparent px-3">Or</span>
							</div>
						</div>
						<GoogleOAuthButton mode="sign-in" />
						<p className="text-center text-muted-foreground text-sm">
							Don&apos;t have an Account?{" "}
							<Link
								to={signUpHref}
								search={{ type: undefined }}
								className="font-semibold text-primary hover:opacity-80"
							>
								Register
							</Link>
						</p>
					</>
				) : null}
			</div>
		</AuthLayout>
	);
}
