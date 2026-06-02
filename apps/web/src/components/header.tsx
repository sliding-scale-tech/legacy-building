import { SignOutButton, useAuth } from "@clerk/react";
import { Button, buttonVariants } from "@legacy-building/ui/components/button";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/lib/routes";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
	const { isSignedIn } = useAuth();
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
	] as const;

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} to={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					{isSignedIn ? (
						<SignOutButton>
							<Button variant="outline" size="sm">
								Sign out
							</Button>
						</SignOutButton>
					) : (
						<>
							<Link
								to={ROUTES.login}
								className={cn(
									buttonVariants({ variant: "outline", size: "sm" }),
								)}
							>
								Sign in
							</Link>
							<Link
								to={ROUTES.signup}
								search={{ type: undefined }}
								className={cn(buttonVariants({ size: "sm" }))}
							>
								Sign up
							</Link>
						</>
					)}
					<ModeToggle />
				</div>
			</div>
			<hr />
		</div>
	);
}
