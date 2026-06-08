import { assets, brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import type { ReactNode } from "react";

type AuthLayoutProps = {
	children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div
			className="relative flex min-h-svh w-full items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-12"
			style={{ backgroundColor: brand.pageBackground }}
		>
			<div className="grid w-full max-w-[1400px] grid-cols-1 items-center lg:grid-cols-2 lg:gap-16">
				<AuthHeroPanel />
				<div className="flex w-full justify-center lg:justify-start">
					<div className="w-full max-w-md">
						<div className="mb-6 flex justify-center lg:hidden">
							<img
								src={assets.logo}
								alt="Legacy Building"
								className="h-10 w-auto object-contain"
							/>
						</div>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}

function AuthHeroPanel() {
	return (
		<div
			className={cn(
				"relative mx-auto hidden aspect-square w-full max-w-[640px] overflow-hidden lg:flex",
				"rounded-3xl shadow-[0_18px_48px_-24px_rgba(0,0,0,0.35)]",
			)}
		>
			<div
				className="relative w-5 shrink-0 rounded-l-3xl"
				style={{ backgroundColor: brand.primary }}
				aria-hidden
			>
				<div
					className="absolute inset-x-0 inset-y-6"
					style={{
						backgroundImage: `radial-gradient(${brand.white} 1.2px, transparent 1.4px)`,
						backgroundSize: "100% 18px",
						backgroundRepeat: "repeat-y",
						backgroundPosition: "center",
					}}
				/>
			</div>
			<div className="relative flex flex-1 flex-col items-center justify-center px-10 py-12 text-center">
				<div
					className="absolute inset-0 bg-center bg-cover"
					style={{
						backgroundImage: `url("${assets.authPanelBackground}")`,
					}}
					aria-hidden
				/>
				<div
					className="absolute inset-0"
					style={{ backgroundColor: `${brand.primary}55` }}
					aria-hidden
				/>
				<div className="relative flex flex-col items-center gap-6">
					<img
						src={assets.logo}
						alt="Legacy Building"
						className="h-auto w-48 select-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.25)]"
						draggable={false}
					/>
					<div className="flex flex-col gap-3">
						<h2
							className="font-heading font-semibold text-3xl leading-tight tracking-tight sm:text-4xl"
							style={{ color: brand.white }}
						>
							Write Your Story
						</h2>
						<p
							className="font-medium text-base sm:text-lg"
							style={{ color: brand.white }}
						>
							Preserve your Story! Narrate theirs!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
