import { useClerk, useSignIn, useSignUp } from "@clerk/react";
import {
	navigateAfterAuth,
	navigateTo,
} from "@legacy-building/ui/lib/navigation";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/sso-callback")({
	component: SsoCallbackPage,
});

function SsoCallbackPage() {
	const clerk = useClerk();
	const { signIn } = useSignIn();
	const { signUp } = useSignUp();
	const navigate = useNavigate();
	const hasRun = useRef(false);

	const goToLogin = useCallback(() => {
		navigateTo(navigate, ROUTES.login);
	}, [navigate]);

	const finalizeSignIn = useCallback(async () => {
		if (!signIn) return;
		const { error } = await signIn.finalize({
			navigate: async ({ session, decorateUrl }) => {
				if (session?.currentTask) {
					return;
				}
				navigateAfterAuth(navigate, decorateUrl(ROUTES.dashboard));
			},
		});
		if (error) {
			console.error(error);
		}
	}, [signIn, navigate]);

	const finalizeSignUp = useCallback(async () => {
		if (!signUp) return;
		const { error } = await signUp.finalize({
			navigate: async ({ session, decorateUrl }) => {
				if (session?.currentTask) {
					return;
				}
				navigateAfterAuth(navigate, decorateUrl(ROUTES.dashboard));
			},
		});
		if (error) {
			console.error(error);
		}
	}, [signUp, navigate]);

	useEffect(() => {
		void (async () => {
			if (!clerk.loaded || hasRun.current) {
				return;
			}
			if (!signIn || !signUp) {
				return;
			}

			hasRun.current = true;

			if (signIn.status === "complete") {
				await finalizeSignIn();
				return;
			}

			if (signUp.isTransferable) {
				const { error } = await signIn.create({ transfer: true });
				if (error) {
					console.error(error);
					goToLogin();
					return;
				}
				const signInStatus = signIn.status as string;
				if (signInStatus === "complete") {
					await finalizeSignIn();
					return;
				}
				return goToLogin();
			}

			if (
				signIn.status === "needs_first_factor" &&
				!signIn.supportedFirstFactors?.every(
					(f) => f.strategy === "enterprise_sso",
				)
			) {
				return goToLogin();
			}

			if (signIn.isTransferable) {
				const { error } = await signUp.create({ transfer: true });
				if (error) {
					console.error(error);
					goToLogin();
					return;
				}
				if (signUp.status === "complete") {
					await finalizeSignUp();
					return;
				}
				navigateTo(navigate, ROUTES.loginContinue);
				return;
			}

			if (signUp.status === "complete") {
				await finalizeSignUp();
				return;
			}

			if (
				signIn.status === "needs_second_factor" ||
				signIn.status === "needs_new_password"
			) {
				return goToLogin();
			}

			if (signIn.existingSession || signUp.existingSession) {
				const sessionId =
					signIn.existingSession?.sessionId ||
					signUp.existingSession?.sessionId;
				if (sessionId) {
					await clerk.setActive({
						session: sessionId,
						navigate: async ({ session: sess, decorateUrl }) => {
							if (sess?.currentTask) {
								return;
							}
							navigateAfterAuth(navigate, decorateUrl(ROUTES.dashboard));
						},
					});
					return;
				}
			}

			goToLogin();
		})();
	}, [
		clerk,
		clerk.loaded,
		signIn,
		signUp,
		navigate,
		goToLogin,
		finalizeSignIn,
		finalizeSignUp,
	]);

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4">
			<div
				className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
				aria-hidden
			/>
			<p className="text-muted-foreground text-sm">Finishing sign-in…</p>
			<div id="clerk-captcha" />
		</div>
	);
}
