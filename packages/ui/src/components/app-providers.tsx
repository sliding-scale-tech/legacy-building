"use client";

import { useDeviceInfoSync } from "@legacy-building/ui/hooks/use-device-info-sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
	useDeviceInfoSync();

	return children;
}
