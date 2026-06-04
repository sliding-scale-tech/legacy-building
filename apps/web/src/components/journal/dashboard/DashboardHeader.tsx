import { useUser } from "@clerk/react";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import {
	assets,
	brand,
	dashboardLayout,
} from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";

import { usePricing } from "@/components/billing/PricingProvider";
import { DashboardHeaderProfileMenu } from "@/components/journal/dashboard/DashboardHeaderProfileMenu";
import { ROUTES } from "@/lib/routes";

const navLinks = [
	{ id: "desk", label: "Desk", to: ROUTES.dashboardDesk },
	{ id: "library", label: "Library", to: ROUTES.dashboardLibrary },
	{ id: "account", label: "Account", to: ROUTES.dashboardAccount },
] as const;

const navLinkClass =
	"mx-3 text-base leading-[1.4] transition-colors duration-200";

export function DashboardHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user } = useUser();
	const { convexUser } = useCurrentUser();
	const { openPricing } = usePricing();
	const avatarUrl =
		convexUser?.profilePictureUrl ?? user?.imageUrl ?? assets.defaultAvatar;

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
				className="flex w-full max-w-[1200px] items-center justify-between gap-1.5"
				style={{ minHeight: dashboardLayout.headerMinHeight }}
			>
				<Link
					to={ROUTES.dashboardDesk}
					className="relative shrink-0"
					style={{
						width: dashboardLayout.logoWidth,
						height: dashboardLayout.logoHeight,
					}}
				>
					<img
						src={assets.whiteLogo}
						alt="Legacy Building"
						className="absolute inset-0 size-full object-contain object-left"
					/>
				</Link>

				<nav className="flex items-center" aria-label="Main">
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
					<button
						type="button"
						onClick={openPricing}
						className={cn(
							navLinkClass,
							"cursor-pointer font-normal hover:text-white/90",
						)}
						style={{ color: brand.navInactive }}
					>
						Pricing
					</button>
				</nav>

				<div
					className="flex shrink-0 items-center justify-end"
					style={{ minWidth: dashboardLayout.headerAvatarMinWidth }}
				>
					<DashboardHeaderProfileMenu avatarUrl={avatarUrl} />
				</div>
			</div>
		</header>
	);
}
