import { SignOutButton, useAuth } from "@clerk/react";
import { Button, buttonVariants } from "@legacy-building/ui/components/button";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import { ModeToggle } from "@/components/mode-toggle";
import { ADMIN_APP_BRAND, ADMIN_NAV_LINKS } from "@/lib/nav";
import { ROUTES } from "@/lib/routes";

export function AdminHeader() {
	const { isSignedIn } = useAuth();

	return (
		<header className="border-border border-b bg-background">
			<div className="mx-auto flex max-w-5xl flex-row items-center justify-between gap-4 px-4 py-3 sm:px-6">
				<div className="flex min-w-0 flex-1 items-center gap-6">
					<Link
						to={ADMIN_APP_BRAND.href}
						className="shrink-0 font-heading font-semibold text-foreground text-sm tracking-tight transition-opacity hover:opacity-80 sm:text-base"
					>
						{ADMIN_APP_BRAND.name}
					</Link>
					<nav className="flex gap-1 sm:gap-2">
						{ADMIN_NAV_LINKS.map(({ to, label, icon: Icon }) => (
							<Link
								key={to}
								to={to}
								className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
							>
								<Icon className="size-4 shrink-0" aria-hidden />
								<span className="hidden sm:inline">{label}</span>
							</Link>
						))}
					</nav>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					{isSignedIn ? (
						<SignOutButton>
							<Button variant="outline" size="sm">
								Sign out
							</Button>
						</SignOutButton>
					) : (
						<>
							<Link
								to={ROUTES.signIn}
								className={cn(
									buttonVariants({ variant: "outline", size: "sm" }),
								)}
							>
								Sign in
							</Link>
							<Link
								to={ROUTES.signIn}
								className={cn(buttonVariants({ size: "sm" }))}
							>
								Sign up
							</Link>
						</>
					)}
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}
