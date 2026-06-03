"use client";

import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/lib/routes";

export function DashboardFooter() {
	const linkClass = cn(
		"font-semibold text-base leading-[1.4] transition-opacity hover:opacity-80",
	);

	return (
		<footer
			className="flex flex-wrap items-center justify-center gap-5 px-4 py-5"
			style={{ backgroundColor: brand.footerBg }}
		>
			<Link
				to={ROUTES.terms}
				className={linkClass}
				style={{ color: brand.primary }}
			>
				Terms of Service
			</Link>
			<div
				className="shrink-0"
				style={{
					width: 1,
					height: 20,
					backgroundColor: brand.text,
				}}
				aria-hidden
			/>
			<Link
				to={ROUTES.privacy}
				className={linkClass}
				style={{ color: brand.primary }}
			>
				Privacy Policy
			</Link>
		</footer>
	);
}
