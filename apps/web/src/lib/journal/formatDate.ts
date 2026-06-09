/**
 * Single source of truth for date display across the app.
 * Format: "Jun 1, 2026" (short month, day, year).
 */
export function formatDate(ms: number): string {
	return new Date(ms).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/** Long-form date for PDF export (e.g. June 5, 2026). */
export function formatPdfLongDate(ms: number): string {
	return new Date(ms).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}
