import { Toaster } from "@legacy-building/ui/components/sonner";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { isAuthPath, ROUTES } from "@/lib/routes";

import "../index.css";

export type RouterAppContext = Record<string, unknown>;

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Legacy Building",
			},
			{
				name: "description",
				content: "Legacy Building is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isDashboard = pathname.startsWith("/dashboard");
	const isLegalPage = pathname === "/terms" || pathname === "/privacy";
	const isAuthRoute = isAuthPath(pathname);
	const isWelcome = pathname === ROUTES.welcome;
	const showMarketingHeader =
		!isDashboard && !isLegalPage && !isAuthRoute && !isWelcome;

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				forcedTheme={isAuthRoute || isDashboard ? "light" : undefined}
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<div
					className={
						isDashboard || isLegalPage
							? "min-h-svh"
							: "grid h-svh grid-rows-[auto_1fr]"
					}
				>
					{showMarketingHeader ? <Header /> : null}
					<Outlet />
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
