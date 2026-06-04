import { SignOutButton, useAuth } from "@clerk/react";
import { Button } from "@legacy-building/ui/components/button";
import {
	assets,
	brand,
	dashboardLayout,
} from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";

import { ModeToggle } from "@/components/mode-toggle";
import { isAdminAuthPath } from "@/lib/auth-routes";
import { ADMIN_NAV_LINKS } from "@/lib/nav";
import { ROUTES } from "@/lib/routes";

const navLinkClass =
	"mx-2 text-base leading-[1.4] transition-colors duration-200 sm:mx-3";

export function AdminHeader() {
	const { isSignedIn } = useAuth();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const onAuthRoute = isAdminAuthPath(pathname);

	if (onAuthRoute) {
		return null;
	}

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-[1504] flex min-h-[80px] items-center justify-center",
				"bg-center bg-cover bg-no-repeat shadow-[0_2px_2px_0_#f7f7f7]",
			)}
			style={{
				backgroundImage: `url("${assets.headerBackground}")`,
				paddingLeft: dashboardLayout.headerPaddingLeft,
				paddingRight: dashboardLayout.headerPaddingRight,
			}}
		>
			<div
				className="flex w-full max-w-[1200px] items-center justify-between gap-2 sm:gap-4"
				style={{ minHeight: dashboardLayout.headerMinHeight }}
			>
				<Link
					to={ROUTES.dashboard}
					className="relative shrink-0"
					style={{
						width: dashboardLayout.logoWidth,
						height: dashboardLayout.logoHeight,
					}}
				>
					<img
						src={assets.whiteLogo}
						alt="Legacy Building Admin"
						className="absolute inset-0 size-full object-contain object-left"
					/>
				</Link>

				<nav
					className="hidden min-w-0 flex-1 items-center justify-center md:flex"
					aria-label="Admin"
				>
					{ADMIN_NAV_LINKS.map((item) => {
						const isActive =
							pathname === item.to ||
							(item.to !== ROUTES.dashboard &&
								pathname.startsWith(`${item.to}/`));
						return (
							<Link
								key={item.to}
								to={item.to}
								className={cn(
									navLinkClass,
									isActive
										? "font-semibold text-white"
										: "font-normal hover:text-white/90",
								)}
								style={{
									color: isActive ? brand.white : brand.navInactive,
								}}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div
					className="flex shrink-0 items-center justify-end gap-2"
					style={{ minWidth: dashboardLayout.headerAvatarMinWidth }}
				>
					<nav
						className="flex items-center gap-1 md:hidden"
						aria-label="Admin mobile"
					>
						{ADMIN_NAV_LINKS.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.to;
							return (
								<Link
									key={item.to}
									to={item.to}
									className={cn(
										"flex size-9 items-center justify-center rounded-full transition-colors",
										isActive
											? "bg-white/20 text-white"
											: "text-white/70 hover:text-white",
									)}
									aria-label={item.label}
									title={item.label}
								>
									<Icon className="size-4" aria-hidden />
								</Link>
							);
						})}
					</nav>
					<ModeToggle variant="header" />
					{isSignedIn ? (
						<SignOutButton>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-9 rounded-full border border-white/30 bg-white/10 px-4 font-medium text-sm text-white hover:bg-white/20 hover:text-white"
							>
								Sign out
							</Button>
						</SignOutButton>
					) : null}
				</div>
			</div>
		</header>
	);
}
