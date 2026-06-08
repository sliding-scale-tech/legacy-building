type PaymentMethodDisplayProps = {
	label: string;
	kind: "card" | "google_pay" | "apple_pay" | "other";
};

export function PaymentMethodDisplay({
	label,
	kind,
}: PaymentMethodDisplayProps) {
	if (kind === "google_pay") {
		return (
			<span className="inline-flex items-center gap-1.5 font-semibold text-[#1a1a1a]">
				<span className="inline-flex h-5 items-center rounded border border-[#dadce0] bg-white px-1.5 font-bold text-[#5f6368] text-[10px] tracking-tight">
					G
				</span>
				<span>{label.replace(/^Google Pay · /, "") || "Pay"}</span>
			</span>
		);
	}

	if (kind === "apple_pay") {
		return (
			<span className="inline-flex items-center gap-1.5 font-semibold text-[#1a1a1a]">
				<svg
					viewBox="0 0 24 24"
					className="size-5 shrink-0"
					role="img"
					aria-label="Apple Pay"
					fill="currentColor"
				>
					<title>Apple Pay</title>
					<path d="M16.365 1.43c0 1.14-.465 2.223-1.207 3.012-.764.812-2.035 1.437-3.158 1.353-.138-1.095.48-2.25 1.215-3.012.787-.825 2.145-1.443 3.15-1.353zm1.103 4.755c-1.776-.102-3.282 1.012-4.125 1.012-.855 0-2.163-1.012-3.555-1.012-1.83 0-3.51 1.065-4.59 2.715-1.965 3.405-.51 8.445 1.395 11.205 1.012 1.47 2.205 3.12 3.78 3.06 1.515-.06 2.085-.975 3.915-.975 1.815 0 2.325.975 3.915.945 1.62-.03 2.64-1.485 3.63-2.97 1.14-1.665 1.605-3.285 1.635-3.375-.03-.015-3.15-1.215-3.18-4.815-.03-3.015 2.475-4.455 2.595-4.545-1.41-2.085-3.615-2.355-4.395-2.415z" />
				</svg>
				<span>{label.replace(/^Apple Pay · /, "") || "Pay"}</span>
			</span>
		);
	}

	return <span className="font-semibold text-[#1a1a1a]">{label}</span>;
}
