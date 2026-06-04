import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { Skeleton } from "@legacy-building/ui/components/skeleton";
import { cn } from "@legacy-building/ui/lib/utils";

import {
	AccountStatusBadge,
	RoleBadge,
	SubscriptionStatusBadge,
} from "@/components/subscription-status-badge";
import {
	adminCardClass,
	adminTableCellMutedClass,
	adminTableCellPrimaryClass,
	adminTableHeadCellClass,
	adminTableHeadRowClass,
	adminTableRowClass,
} from "@/lib/admin-theme";

export type AdminUserRow = {
	_id: Id<"users">;
	email: string;
	name: string;
	role: "admin" | "user";
	accountStatus: "active" | "suspended";
	subscriptionStatus:
		| "active"
		| "trialing"
		| "grace_period"
		| "canceled"
		| "none"
		| null;
};

type UsersTableProps = {
	users: AdminUserRow[];
	isLoading?: boolean;
	onSelectUser: (userId: Id<"users">) => void;
};

export function UsersTable({
	users,
	isLoading,
	onSelectUser,
}: UsersTableProps) {
	if (isLoading) {
		return (
			<div className={cn(adminCardClass, "overflow-hidden p-4")}>
				<div className="space-y-3">
					{["a", "b", "c", "d", "e", "f"].map((id) => (
						<Skeleton key={id} className="h-12 w-full rounded-lg" />
					))}
				</div>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div
				className={cn(
					adminCardClass,
					"p-8 text-center text-muted-foreground text-sm",
				)}
			>
				No users match your filters.
			</div>
		);
	}

	return (
		<div className={cn(adminCardClass, "overflow-hidden")}>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[640px] text-left text-sm">
					<thead>
						<tr className={adminTableHeadRowClass}>
							<th className={adminTableHeadCellClass}>Name</th>
							<th className={adminTableHeadCellClass}>Email</th>
							<th className={adminTableHeadCellClass}>Role</th>
							<th className={adminTableHeadCellClass}>Status</th>
							<th className={adminTableHeadCellClass}>Subscription</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr
								key={user._id}
								className={adminTableRowClass}
								onClick={() => onSelectUser(user._id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onSelectUser(user._id);
									}
								}}
								tabIndex={0}
							>
								<td className={adminTableCellPrimaryClass}>
									{user.name || "—"}
								</td>
								<td className={adminTableCellMutedClass}>{user.email}</td>
								<td className="px-4 py-3">
									<RoleBadge role={user.role} />
								</td>
								<td className="px-4 py-3">
									<AccountStatusBadge status={user.accountStatus} />
								</td>
								<td className="px-4 py-3">
									<SubscriptionStatusBadge status={user.subscriptionStatus} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
