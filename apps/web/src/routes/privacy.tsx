import {
	PRIVACY_DESCRIPTION,
	PRIVACY_TITLE,
} from "@legacy-building/ui/lib/privacy";
import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { PRIVACY_POLICY_HTML } from "@/lib/legal/privacy-policy-html";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
	head: () => ({
		meta: [{ title: "Privacy Policy · Legacy Building" }],
	}),
});

function PrivacyPage() {
	return (
		<LegalDocumentPage
			title={PRIVACY_TITLE}
			description={PRIVACY_DESCRIPTION}
			htmlContent={PRIVACY_POLICY_HTML}
		/>
	);
}
