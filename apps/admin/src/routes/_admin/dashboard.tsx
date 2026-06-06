import { api } from "@legacy-building/backend/convex/_generated/api";
import { PageLoader } from "@legacy-building/ui/components/page-loader";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	BookOpen,
	CreditCard,
	FileText,
	LockOpen,
	Users,
	XCircle,
} from "lucide-react";

import { AdminStatCard } from "@/components/admin-stat-card";
import { adminContainerClass } from "@/lib/admin-theme";

export const Route = createFileRoute("/_admin/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const insights = useQuery(api.admin.queries.platformInsights);

	return (
		<div className={adminContainerClass}>
			<header className="mb-6">
				<h1 className="font-heading font-semibold text-2xl tracking-tight">
					Platform insights
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Overview of users, content, and subscriptions.
				</p>
			</header>

			{insights === undefined ? (
				<PageLoader overlay={false} className="min-h-[50svh]" />
			) : (
				<div className="space-y-8">
					<section>
						<h2 className="mb-3 font-heading font-medium text-sm">Users</h2>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<AdminStatCard
								label="Total users"
								value={insights.totalUsers}
								icon={Users}
							/>
							<AdminStatCard
								label="Active accounts"
								value={insights.activeAccounts}
							/>
							<AdminStatCard
								label="Suspended"
								value={insights.suspendedAccounts}
							/>
							<AdminStatCard label="Admins" value={insights.adminCount} />
						</div>
					</section>

					<section>
						<h2 className="mb-3 font-heading font-medium text-sm">
							Content & onboarding
						</h2>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<AdminStatCard
								label="Journals"
								value={insights.totalJournals}
								icon={BookOpen}
							/>
							<AdminStatCard
								label="Journal entries"
								value={insights.totalEntries}
								icon={FileText}
							/>
							<AdminStatCard
								label="Welcome completed"
								value={insights.welcomeCompleted}
							/>
							<AdminStatCard
								label="Terms agreed"
								value={insights.termsAgreed}
							/>
						</div>
					</section>

					<section>
						<h2 className="mb-3 font-heading font-medium text-sm">
							Subscriptions
						</h2>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							<AdminStatCard
								label="Paid journal access"
								value={insights.subscriptionPaidAccess}
								icon={LockOpen}
							/>
							<AdminStatCard
								label="Active (paid)"
								value={insights.subscriptionActive}
								icon={CreditCard}
							/>
							<AdminStatCard
								label="Trialing"
								value={insights.subscriptionTrialing}
							/>
							<AdminStatCard
								label="Grace period"
								value={insights.subscriptionGracePeriod}
							/>
							<AdminStatCard
								label="Canceled"
								value={insights.subscriptionCanceled}
								icon={XCircle}
							/>
							<AdminStatCard
								label="No subscription"
								value={insights.subscriptionNone}
							/>
							<AdminStatCard
								label="Status unset"
								value={insights.subscriptionUnset}
							/>
						</div>
					</section>
				</div>
			)}
		</div>
	);
}
