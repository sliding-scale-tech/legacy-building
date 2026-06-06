import { cn } from "@legacy-building/ui/lib/utils";

import { DotLottieLoader } from "./dot-lottie-loader";

type PageLoaderProps = {
	message?: string;
	className?: string;
	size?: number;
	/** Full-viewport overlay (default). Set false to center inside a parent region. */
	overlay?: boolean;
};

export function PageLoader({
	message,
	className,
	size = 280,
	overlay = true,
}: PageLoaderProps) {
	const content = (
		<>
			<div
				className="flex shrink-0 items-center justify-center"
				style={{ width: size, height: size }}
			>
				<DotLottieLoader size={size} />
			</div>
			{message ? (
				<p className="max-w-sm text-center text-muted-foreground text-sm">
					{message}
				</p>
			) : (
				<span className="sr-only">Loading</span>
			)}
		</>
	);

	if (overlay) {
		return (
			<div
				className={cn(
					"fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-4 bg-background px-6",
					className,
				)}
				role="status"
				aria-live="polite"
				aria-busy="true"
			>
				{content}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex w-full flex-col items-center justify-center gap-4 px-6",
				className,
			)}
			role="status"
			aria-live="polite"
			aria-busy="true"
		>
			{content}
		</div>
	);
}
