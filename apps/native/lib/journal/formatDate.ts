/** Same format as web: M/DD/YYYY (e.g. 5/04/2026). */
export function formatDate(ms: number): string {
	const d = new Date(ms);
	return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

const SHORT_MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

/** Journal-detail format used in design: "Apr 16, 2026". */
export function formatDateLong(ms: number): string {
	const d = new Date(ms);
	return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
