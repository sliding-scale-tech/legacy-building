/**
 * Parse a "MM/DD/YYYY" string to UTC midnight epoch ms.
 * Returns `null` for empty strings or invalid dates.
 */
export function parseMonthDayYear(input: string): number | null {
	const trimmed = input.trim();
	if (!trimmed) return null;
	const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (!match) return null;

	const month = Number(match[1]);
	const day = Number(match[2]);
	const year = Number(match[3]);

	if (month < 1 || month > 12) return null;
	if (day < 1 || day > 31) return null;
	if (year < 1900 || year > 2999) return null;

	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		// e.g. Feb 31 — JS rolls over; reject.
		return null;
	}
	return date.getTime();
}

/** Local calendar date → `M/DD/YYYY` display string. */
export function formatMonthDayYearFromDate(date: Date): string {
	return `${date.getMonth() + 1}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

/** Parse `MM/DD/YYYY` to a local `Date` for pickers (or `null`). */
export function monthDayYearToDate(input: string): Date | null {
	const ms = parseMonthDayYear(input);
	if (ms === null) return null;
	const d = new Date(ms);
	return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** `Date` → `YYYY-MM-DD` for react-native-calendars. */
export function dateToCalendarKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function monthDayYearToCalendarKey(input: string): string | undefined {
	const date = monthDayYearToDate(input);
	return date ? dateToCalendarKey(date) : undefined;
}

export function calendarKeyToMonthDayYear(key: string): string | null {
	const match = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);

	if (month < 1 || month > 12 || day < 1 || day > 31) return null;
	if (year < 1900 || year > 2999) return null;

	const date = new Date(year, month - 1, day);
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}

	return formatMonthDayYearFromDate(date);
}
