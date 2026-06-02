export const ROUTES = {
	home: "/",
	signIn: "/sign-in",
	dashboard: "/dashboard",
	settings: "/settings",
} as const;

export type AppPath = (typeof ROUTES)[keyof typeof ROUTES];
