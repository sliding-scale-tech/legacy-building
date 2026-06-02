"use client";

import { TermsAgreementDialog } from "@mobile-starter/ui/components/terms-agreement-dialog";
import { useDeviceInfoSync } from "@mobile-starter/ui/hooks/use-device-info-sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
	useDeviceInfoSync();

	return (
		<>
			{children}
			<TermsAgreementDialog />
		</>
	);
}
