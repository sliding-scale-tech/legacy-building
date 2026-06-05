import loaderSrc from "@legacy-building/assets/images/loader.lottie";
import { cn } from "@legacy-building/ui/lib/utils";
import { useEffect, useState } from "react";

const DOTLOTTIE_SCRIPT =
	"https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.3/dist/dotlottie-wc.js";

let scriptPromise: Promise<void> | null = null;

function ensureDotLottieScript() {
	if (typeof window === "undefined") {
		return Promise.resolve();
	}

	if (customElements.get("dotlottie-wc")) {
		return Promise.resolve();
	}

	if (scriptPromise) {
		return scriptPromise;
	}

	scriptPromise = new Promise((resolve, reject) => {
		const existing = document.querySelector(
			`script[src="${DOTLOTTIE_SCRIPT}"]`,
		);
		if (existing) {
			existing.addEventListener("load", () => resolve(), { once: true });
			return;
		}

		const script = document.createElement("script");
		script.src = DOTLOTTIE_SCRIPT;
		script.type = "module";
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load dotlottie-wc"));
		document.head.appendChild(script);
	});

	return scriptPromise;
}

type DotLottieLoaderProps = {
	size?: number;
	className?: string;
};

export function DotLottieLoader({
	size = 300,
	className,
}: DotLottieLoaderProps) {
	const [ready, setReady] = useState(
		() =>
			typeof window !== "undefined" &&
			Boolean(customElements.get("dotlottie-wc")),
	);

	useEffect(() => {
		let cancelled = false;

		void ensureDotLottieScript()
			.then(() => {
				if (!cancelled) {
					setReady(true);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setReady(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, []);

	if (!ready) {
		return (
			<div
				className={cn("animate-pulse rounded-full bg-muted", className)}
				style={{ width: size, height: size }}
				aria-hidden
			/>
		);
	}

	return (
		<dotlottie-wc
			src={loaderSrc}
			autoplay
			loop
			style={{ width: size, height: size, display: "block" }}
			className={cn("mx-auto block", className)}
			aria-label="Loading"
		/>
	);
}
