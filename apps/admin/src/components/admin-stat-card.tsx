import { cn } from "@legacy-building/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

import { adminStatCardClass } from "@/lib/admin-theme";

type AdminStatCardProps = {
	label: string;
	value: number | string;
	icon?: LucideIcon;
	className?: string;
};

export function AdminStatCard({
	label,
	value,
	icon: Icon,
	className,
}: AdminStatCardProps) {
	return (
		<div className={cn(adminStatCardClass, "p-5", className)}>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-muted-foreground text-sm">{label}</p>
					<p className="mt-1 font-heading font-semibold text-3xl tracking-tight">
						{value}
					</p>
				</div>
				{Icon ? (
					<span
						className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ebf6f6] text-[#008080] dark:bg-primary/25 dark:text-primary"
						aria-hidden
					>
						<Icon className="size-5" strokeWidth={1.75} />
					</span>
				) : null}
			</div>
		</div>
	);
}
