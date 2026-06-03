import {
	TERMS_DESCRIPTION,
	TERMS_PARAGRAPHS,
	TERMS_TITLE,
} from "@legacy-building/ui/lib/terms";
import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
	head: () => ({
		meta: [{ title: "Terms and Conditions · Legacy Building" }],
	}),
});

function TermsPage() {
	return (
		<LegalDocumentPage
			title={TERMS_TITLE}
			description={TERMS_DESCRIPTION}
			paragraphs={TERMS_PARAGRAPHS}
		/>
	);
}
