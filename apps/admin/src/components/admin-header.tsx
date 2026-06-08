import { SignOutButton, useAuth } from "@clerk/react";
import { AppDrawer } from "@legacy-building/ui/components/app-drawer";
import { Button } from "@legacy-building/ui/components/button";
import {
	assets,
	brand,
	dashboardLayout,
} from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { isAdminAuthPath } from "@/lib/auth-routes";
import { ADMIN_NAV_LINKS } from "@/lib/nav";
import { ROUTES } from "@/lib/routes";

const navLinkClass =
	"mx-2 text-base leading-[1.4] transition-colors duration-200 sm:mx-3";

const drawerNavLinkClass =
	"flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base leading-[1.4] transition-colors";

export function AdminHeader() {
	const { isSignedIn } = useAuth();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const onAuthRoute = isAdminAuthPath(pathname);
	const [menuOpen, setMenuOpen] = useState(false);

	if (onAuthRoute) {
		return null;
	}

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-[1504] flex min-h-[80px] items-center justify-center",
				"bg-center bg-cover bg-no-repeat shadow-[0_2px_2px_0_#f7f7f7]",
				"px-4 md:pr-10 md:pl-[29px]",
			)}
			style={{
				backgroundImage: `url("${assets.headerBackground}")`,
			}}
		>
			<div
				className="flex w-full max-w-[1200px] items-center justify-between gap-2 sm:gap-4"
				style={{ minHeight: dashboardLayout.headerMinHeight }}
			>
				<div className="flex min-w-0 items-center gap-2">
					<button
						type="button"
						className="flex size-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 md:hidden"
						onClick={() => setMenuOpen(true)}
						aria-label="Open navigation menu"
					>
						<Menu className="size-6" aria-hidden />
					</button>

					<Link
						to={ROUTES.dashboard}
						className="relative h-[30px] w-[120px] shrink-0 md:h-[50px] md:w-[200px]"
						onClick={() => setMenuOpen(false)}
					>
						<img
							src={assets.whiteLogo}
							alt="Legacy Building Admin"
							width={256}
							height={59}
							className="absolute inset-0 size-full object-contain object-left"
						/>
					</Link>
				</div>

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

				<div className="flex shrink-0 items-center justify-end gap-2 md:min-w-[200px]">
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

			<AppDrawer
				open={menuOpen}
				onOpenChange={setMenuOpen}
				side="left"
				title="Admin navigation"
				className="bg-white"
			>
				<nav
					className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4 pt-14"
					aria-label="Admin mobile"
				>
					{ADMIN_NAV_LINKS.map((item) => {
						const Icon = item.icon;
						const isActive =
							pathname === item.to ||
							(item.to !== ROUTES.dashboard &&
								pathname.startsWith(`${item.to}/`));
						return (
							<Link
								key={item.to}
								to={item.to}
								onClick={() => setMenuOpen(false)}
								className={cn(
									drawerNavLinkClass,
									isActive
										? "bg-[#ebf6f6] font-semibold text-[#008080]"
										: "font-normal text-[#1a1a1a] hover:bg-[#f7f7f7]",
								)}
							>
								<Icon className="size-4 shrink-0" aria-hidden />
								{item.label}
							</Link>
						);
					})}
				</nav>
			</AppDrawer>
		</header>
	);
}
