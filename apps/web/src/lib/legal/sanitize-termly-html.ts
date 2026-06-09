/** Strip Termly editor artifacts so legal HTML renders cleanly in-app. */
export function sanitizeTermlyHtml(html: string): string {
	return html
		.replace(/<\/?bdt[^>]*>/gi, "")
		.replace(/\sclass="MsoNormal"/gi, "")
		.replace(/<br>/gi, "<br />")
		.replace(/style="text-align:\s*left;?"/gi, "")
		.replace(/align="center"/gi, "")
		.replace(/\sdata-custom-class="[^"]*"/gi, (match) => {
			// Keep semantic hooks for styling via class names derived from data-custom-class
			const value = /data-custom-class="([^"]*)"/.exec(match)?.[1];
			if (!value || value === "body") return "";
			return ` class="legal-${value.replace(/\s+/g, "-")}"`;
		});
}
