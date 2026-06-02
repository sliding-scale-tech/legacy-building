export const ROUTES = {
	home: "/",
	dashboard: "/dashboard",
	login: "/login",
	signup: "/signup",
	ssoCallback: "/sso-callback",
	verifyEmail: "/verify-email",
	loginContinue: "/login/continue",
} as const;

export type AppPath = (typeof ROUTES)[keyof typeof ROUTES];
