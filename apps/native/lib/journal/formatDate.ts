/** Same format as web: M/DD/YYYY (e.g. 5/04/2026). */
export function formatDate(ms: number): string {
	const d = new Date(ms);
	return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}
