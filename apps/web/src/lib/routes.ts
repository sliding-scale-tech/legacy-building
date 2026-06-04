/** Redirect-only entry; use login or dashboard for user-facing navigation. */
export const ROUTES = {
	home: "/",
	dashboard: "/dashboard",
	dashboardDesk: "/dashboard/desk",
	dashboardLibrary: "/dashboard/library",
	dashboardAccount: "/dashboard/account",
	welcome: "/welcome",
	login: "/login",
	signup: "/signup",
	ssoCallback: "/sso-callback",
	verifyEmail: "/verify-email",
	loginContinue: "/login/continue",
	terms: "/terms",
	privacy: "/privacy",
} as const;

export type AppPath = (typeof ROUTES)[keyof typeof ROUTES];

const AUTH_PATHS: readonly string[] = [
	ROUTES.login,
	ROUTES.signup,
	ROUTES.verifyEmail,
	ROUTES.ssoCallback,
	ROUTES.loginContinue,
];

export function isAuthPath(pathname: string): boolean {
	if (AUTH_PATHS.includes(pathname)) return true;
	return pathname.startsWith("/login/");
}
