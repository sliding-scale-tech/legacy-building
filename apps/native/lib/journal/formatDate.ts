/** Same format as web: "Jun 1, 2026". */
export function formatDate(ms: number): string {
	return formatDateLong(ms);
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
