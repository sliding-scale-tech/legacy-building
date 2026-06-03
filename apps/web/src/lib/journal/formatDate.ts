/**
 * Single source of truth for date display across the app.
 * Edit this one function to change how every date renders.
 * Current format: M/DD/YYYY (e.g. 6/02/2026).
 */
export function formatDate(ms: number): string {
	const d = new Date(ms);
	return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}
