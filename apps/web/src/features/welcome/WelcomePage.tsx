import { assets, brand, youtube } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";

import { Button } from "@/components/journal/ui/button";

type WelcomePageProps = {
	userName: string;
	onHomepage: () => void;
	loading?: boolean;
};

export function WelcomePage({
	userName,
	onHomepage,
	loading = false,
}: WelcomePageProps) {
	const embedSrc = `https://www.youtube.com/embed/${youtube.welcomeVideoId}?rel=0&enablejsapi=1`;

	return (
		<main
			className={cn(
				"relative flex min-h-svh w-full flex-col items-center justify-center",
				"bg-center bg-cover bg-no-repeat px-4 py-10",
			)}
			style={{ backgroundImage: `url("${assets.heroBackground}")` }}
		>
			<div className="flex w-full max-w-[1400px] flex-col items-center justify-center gap-10">
				<h1
					className="text-center font-semibold text-[clamp(2rem,5vw,44px)] text-white leading-[1.4]"
					style={{
						fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
					}}
				>
					Welcome {userName}
				</h1>

				<div className="flex w-full flex-col items-center gap-6">
					<div className="w-full max-w-[800px] rounded-[20px] bg-transparent p-6 sm:p-10">
						<div className="relative aspect-video min-h-[300px] w-full overflow-hidden rounded-[20px]">
							<iframe
								title="Legacy Building welcome video"
								src={embedSrc}
								allow="autoplay; fullscreen"
								allowFullScreen
								className="absolute inset-0 size-full border-0"
							/>
						</div>
					</div>

					<Button
						type="button"
						onClick={onHomepage}
						disabled={loading}
						className={cn(
							"min-h-11 min-w-[200px] rounded-full px-20 font-bold text-sm leading-none shadow-[2px_2px_4px_0px_rgb(170,170,170)]",
							"transition-colors duration-200 hover:opacity-95 disabled:opacity-70",
						)}
						style={{
							backgroundColor: brand.white,
							color: brand.primary,
						}}
					>
						{loading ? "Loading…" : "Homepage"}
					</Button>
				</div>
			</div>
		</main>
	);
}
