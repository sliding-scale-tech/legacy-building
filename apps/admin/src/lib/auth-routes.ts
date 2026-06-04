import { ROUTES } from "@/lib/routes";

export function isAdminAuthPath(pathname: string): boolean {
	return pathname === ROUTES.signIn || pathname.startsWith(`${ROUTES.signIn}/`);
}
