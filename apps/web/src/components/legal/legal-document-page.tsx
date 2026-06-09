import { brand, dashboardLayout } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";

import { LegalPageNavbar } from "@/components/legal/legal-page-navbar";

type LegalDocumentPageProps = {
	title: string;
	description: string;
	paragraphs?: readonly string[];
	htmlContent?: string;
};

export function LegalDocumentPage({
	title,
	description,
	paragraphs,
	htmlContent,
}: LegalDocumentPageProps) {
	const bodyClassName = cn(
		"mt-6 pr-1 text-[#595959] text-sm leading-relaxed",
		htmlContent
			? "legal-termly-content library-modal-scroll max-h-[min(70svh,720px)] overflow-y-auto"
			: "max-h-[min(60svh,520px)] space-y-4 overflow-y-auto",
	);

	return (
		<div
			className="flex min-h-svh flex-col"
			style={{ backgroundColor: brand.pageBackground }}
		>
			<LegalPageNavbar />

			<div
				className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-6"
				style={{
					paddingTop: dashboardLayout.contentMarginTop + 24,
				}}
			>
				<article
					className={cn(
						"w-full max-w-3xl rounded-2xl border bg-white shadow-sm",
						"border-[#e6e6e6] p-6 sm:p-8 md:p-10",
					)}
				>
					{htmlContent ? null : (
						<header className="border-[#e6e6e6] border-b pb-5">
							<h1 className="font-semibold text-2xl text-[#1a1a1a] tracking-tight sm:text-3xl">
								{title}
							</h1>
							<p className="mt-2 text-[#525252] text-sm leading-relaxed">
								{description}
							</p>
						</header>
					)}

					<div className={bodyClassName}>
						{htmlContent ? (
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Termly HTML is trusted counsel-provided legal copy.
							<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
						) : (
							paragraphs?.map((paragraph) => (
								<p key={paragraph.slice(0, 32)}>{paragraph}</p>
							))
						)}
					</div>
				</article>
			</div>
		</div>
	);
}
