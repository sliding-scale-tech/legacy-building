import { TERMS_DESCRIPTION, TERMS_TITLE } from "@legacy-building/ui/lib/terms";
import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { TERMS_OF_SERVICE_HTML } from "@/lib/legal/terms-of-service-html";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
	head: () => ({
		meta: [{ title: "Terms of Service · Legacy Building" }],
	}),
});

function TermsPage() {
	return (
		<LegalDocumentPage
			title={TERMS_TITLE}
			description={TERMS_DESCRIPTION}
			htmlContent={TERMS_OF_SERVICE_HTML}
		/>
	);
}
