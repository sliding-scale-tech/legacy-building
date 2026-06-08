import { useClerk, useUser } from "@clerk/react";
import { AppDrawer } from "@legacy-building/ui/components/app-drawer";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import {
	assets,
	brand,
	dashboardLayout,
} from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

import { DashboardHeaderProfileMenu } from "@/components/journal/dashboard/DashboardHeaderProfileMenu";
import { ROUTES } from "@/lib/routes";

const navLinks = [
	{ id: "desk", label: "Desk", to: ROUTES.dashboardDesk },
	{ id: "library", label: "Library", to: ROUTES.dashboardLibrary },
	{ id: "account", label: "Account", to: ROUTES.dashboardAccount },
	{ id: "billing", label: "Billing", to: ROUTES.dashboardBilling },
] as const;

const navLinkClass =
	"mx-3 text-base leading-[1.4] transition-colors duration-200";

const drawerNavLinkClass =
	"flex w-full max-w-[260px] items-center justify-center rounded-xl px-4 py-3 text-center text-base leading-[1.4] transition-colors";

export function DashboardHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user } = useUser();
	const { signOut } = useClerk();
	const { convexUser } = useCurrentUser();
	const [menuOpen, setMenuOpen] = useState(false);
	const avatarUrl =
		convexUser?.profilePictureUrl ?? user?.imageUrl ?? assets.defaultAvatar;

	const handleSignOut = () => {
		setMenuOpen(false);
		void signOut({ redirectUrl: ROUTES.login });
	};

	return (
		<>
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
					className="flex w-full max-w-[1200px] items-center justify-between gap-2 md:gap-1.5"
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
							to={ROUTES.dashboardDesk}
							className="relative h-[30px] w-[120px] shrink-0 md:h-[50px] md:w-[200px]"
							onClick={() => setMenuOpen(false)}
						>
							<img
								src={assets.whiteLogo}
								alt="Legacy Building"
								width={256}
								height={59}
								className="absolute inset-0 size-full object-contain object-left"
							/>
						</Link>
					</div>

					<nav className="hidden items-center md:flex" aria-label="Main">
						{navLinks.map((item) => {
							const isActive = pathname === item.to;
							return (
								<Link
									key={item.id}
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

					<div className="hidden shrink-0 items-center justify-end md:flex md:min-w-[200px]">
						<DashboardHeaderProfileMenu avatarUrl={avatarUrl} />
					</div>
				</div>
			</header>

			<AppDrawer
				open={menuOpen}
				onOpenChange={setMenuOpen}
				side="left"
				title="Navigation"
				showCloseButton={false}
				className="bg-white"
			>
				<div
					className="relative shrink-0 bg-center bg-cover px-5 pt-5 pb-5"
					style={{
						backgroundImage: `url("${assets.headerBackground}")`,
					}}
				>
					<button
						type="button"
						onClick={() => setMenuOpen(false)}
						className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
						aria-label="Close navigation menu"
					>
						<X className="size-5" aria-hidden />
					</button>
					<Link
						to={ROUTES.dashboardDesk}
						onClick={() => setMenuOpen(false)}
						className="mx-auto flex h-10 w-[160px] items-center justify-center"
					>
						<img
							src={assets.whiteLogo}
							alt="Legacy Building"
							width={256}
							height={59}
							className="h-full w-full object-contain"
						/>
					</Link>
				</div>

				<nav
					className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto p-4"
					aria-label="Main mobile"
				>
					{navLinks.map((item) => {
						const isActive = pathname === item.to;
						return (
							<Link
								key={item.id}
								to={item.to}
								onClick={() => setMenuOpen(false)}
								className={cn(
									drawerNavLinkClass,
									isActive
										? "bg-[#ebf6f6] font-semibold text-[#008080]"
										: "font-normal text-[#1a1a1a] hover:bg-[#f7f7f7]",
								)}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className="mt-auto flex flex-col items-center border-[#e6e6e6] border-t p-4 pb-6">
					<div className="mb-4 flex flex-col items-center gap-2 text-center">
						<div
							className="size-16 shrink-0 rounded-full border-2 border-[#008080] bg-center bg-cover bg-no-repeat"
							style={{ backgroundImage: `url("${avatarUrl}")` }}
							aria-hidden
						/>
						<p className="max-w-[240px] truncate font-medium text-[#1a1a1a] text-sm">
							{user?.fullName ??
								user?.primaryEmailAddress?.emailAddress ??
								"Account"}
						</p>
					</div>
					<button
						type="button"
						onClick={handleSignOut}
						className={cn(
							drawerNavLinkClass,
							"gap-2.5 font-medium text-[#1a1a1a] hover:bg-[#f7f7f7]",
						)}
					>
						<LogOut className="size-4 shrink-0 text-[#525252]" aria-hidden />
						Sign out
					</button>
				</div>
			</AppDrawer>
		</>
	);
}
