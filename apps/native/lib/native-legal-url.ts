import type { nativeLegalRoutes } from "@/lib/legal-routes";

/** Web app origin for opening /terms and /privacy in the device browser. */
const WEB_APP_ORIGIN =
	process.env.EXPO_PUBLIC_WEB_APP_URL?.replace(/\/$/, "") ??
	"http://localhost:3001";

export function nativeLegalUrl(
	path: (typeof nativeLegalRoutes)[keyof typeof nativeLegalRoutes],
) {
	return `${WEB_APP_ORIGIN}${path}`;
}
