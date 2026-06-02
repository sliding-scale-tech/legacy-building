import { api } from "@legacy-building/backend/convex/_generated/api";
import { buttonVariants } from "@legacy-building/ui/components/button";
import { Skeleton } from "@legacy-building/ui/components/skeleton";
import { cn } from "@legacy-building/ui/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

function HomeComponent() {
	const me = useQuery(api.user.queries.me);

	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">Account</h2>
					{me === undefined ? (
						<Skeleton className="h-4 w-32" />
					) : me ? (
						<p className="text-muted-foreground text-sm">
							Signed in as {me.name} ({me.role})
						</p>
					) : (
						<p className="text-muted-foreground text-sm">Not signed in</p>
					)}
					<div className="mt-4 flex flex-wrap gap-2">
						<Link
							to={ROUTES.login}
							className={cn(buttonVariants({ variant: "default" }))}
						>
							Sign in
						</Link>
						<Link
							to={ROUTES.signup}
							search={{ type: undefined }}
							className={cn(buttonVariants({ variant: "outline" }))}
						>
							Sign up
						</Link>
						<Link
							to={ROUTES.dashboard}
							className={cn(buttonVariants({ variant: "outline" }))}
						>
							Dashboard
						</Link>
					</div>
				</section>
			</div>
		</div>
	);
}
