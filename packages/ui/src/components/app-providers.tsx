"use client";

import { TermsAgreementDialog } from "@legacy-building/ui/components/terms-agreement-dialog";
import { useDeviceInfoSync } from "@legacy-building/ui/hooks/use-device-info-sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
	useDeviceInfoSync();

	return (
		<>
			{children}
			<TermsAgreementDialog />
		</>
	);
}
