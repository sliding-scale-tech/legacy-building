import { APP_NAME } from "@legacy-building/ui/lib/brand";
import { LayoutDashboard, Settings } from "lucide-react";

import { ROUTES } from "@/lib/routes";

export const ADMIN_APP_BRAND = {
	name: `${APP_NAME} Admin`,
	href: ROUTES.dashboard,
} as const;

export const ADMIN_NAV_LINKS = [
	{ to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
	{ to: ROUTES.settings, label: "Settings", icon: Settings },
] as const;

export const ADMIN_AUTH_ROUTE_PREFIXES = [ROUTES.signIn] as const;
