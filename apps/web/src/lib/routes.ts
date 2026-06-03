export const ROUTES = {
	home: "/",
	dashboard: "/dashboard",
	dashboardDesk: "/dashboard/desk",
	dashboardLibrary: "/dashboard/library",
	dashboardAccount: "/dashboard/account",
	login: "/login",
	signup: "/signup",
	ssoCallback: "/sso-callback",
	verifyEmail: "/verify-email",
	loginContinue: "/login/continue",
	terms: "/terms",
	privacy: "/privacy",
} as const;

export type AppPath = (typeof ROUTES)[keyof typeof ROUTES];
