import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

import { PricingModal } from "@/components/billing/PricingModal";

type PricingContextValue = {
	open: boolean;
	openPricing: () => void;
	closePricing: () => void;
};

const PricingContext = createContext<PricingContextValue | null>(null);

export function PricingProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);

	const value = useMemo<PricingContextValue>(
		() => ({
			open,
			openPricing: () => setOpen(true),
			closePricing: () => setOpen(false),
		}),
		[open],
	);

	return (
		<PricingContext.Provider value={value}>
			{children}
			<PricingModal open={open} onOpenChange={setOpen} />
		</PricingContext.Provider>
	);
}

export function usePricing(): PricingContextValue {
	const ctx = useContext(PricingContext);
	if (!ctx) {
		throw new Error("usePricing must be used within a PricingProvider");
	}
	return ctx;
}
