import { Button, buttonVariants } from "@mobile-starter/ui/components/button";
import { APP_NAME } from "@mobile-starter/ui/lib/brand";
import { cn } from "@mobile-starter/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Home, LogIn, ShieldAlert } from "lucide-react";

import { ROUTES } from "@/lib/routes";

export function AdminForbidden() {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-auto bg-background px-6 py-16">
			<div className="relative mx-auto flex w-full max-w-xl flex-col items-center text-center">
				<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.2em] shadow-sm backdrop-blur-sm">
					<ShieldAlert
						className="size-3.5 shrink-0"
						strokeWidth={2}
						aria-hidden
					/>
					Access denied
				</div>

				<span className="font-black font-mono text-[clamp(4rem,20vw,8rem)] text-foreground leading-none tracking-tighter">
					403
				</span>

				<h1 className="mt-4 font-heading font-semibold text-2xl tracking-tight sm:text-3xl">
					Clearance insufficient
				</h1>
				<p className="mt-3 max-w-sm text-muted-foreground text-sm leading-relaxed sm:text-base">
					This account does not have admin access. Sign in with an admin account
					or contact your administrator.
				</p>

				<p className="mt-5 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-[0.18em]">
					{APP_NAME} Admin &middot; 403
				</p>

				<div className="mt-9 flex flex-wrap items-center justify-center gap-3">
					<Link
						to={ROUTES.dashboard}
						className={cn(
							buttonVariants({ variant: "default", size: "lg" }),
							"h-11 rounded-full px-7 transition-transform active:scale-[0.97]",
						)}
					>
						<Home className="size-4" aria-hidden />
						Dashboard
					</Link>
					<Link
						to={ROUTES.signIn}
						className={cn(
							buttonVariants({ variant: "ghost", size: "lg" }),
							"h-11 rounded-full px-7 transition-transform active:scale-[0.97]",
						)}
					>
						<LogIn className="size-4" aria-hidden />
						Sign in
					</Link>
					<Button
						type="button"
						variant="outline"
						size="lg"
						className="h-11 rounded-full px-7 transition-transform active:scale-[0.97]"
						onClick={() => window.history.back()}
					>
						Go back
					</Button>
				</div>
			</div>
		</div>
	);
}
