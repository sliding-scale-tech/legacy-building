import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native/hooks";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

import {
	calendarKeyToMonthDayYear,
	dateToCalendarKey,
	monthDayYearToCalendarKey,
} from "@/lib/journal/parse-date";

type DateFieldProps = {
	value: string;
	onChange: (next: string) => void;
	placeholder?: string;
	invalid?: boolean;
	minimumDate?: Date;
	maximumDate?: Date;
};

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

/** "Fri, 5 Jun" — matches the Material header in the design. */
function formatHeaderLabel(date: Date): string {
	const weekday = SHORT_WEEKDAYS[date.getDay()];
	const month = SHORT_MONTHS[date.getMonth()];
	return `${weekday}, ${date.getDate()} ${month}`;
}

function parseCalendarKey(key: string): Date {
	const [year, month, day] = key.split("-").map(Number);
	return new Date(year, month - 1, day);
}

export function DateField({
	value,
	onChange,
	placeholder = "Select date",
	invalid = false,
	minimumDate,
	maximumDate,
}: DateFieldProps) {
	const [open, setOpen] = useState(false);
	const [pendingKey, setPendingKey] = useState<string | undefined>(undefined);
	const [
		accent,
		accentForeground,
		foreground,
		placeholderColor,
		background,
		destructive,
	] = useThemeColor([
		"accent",
		"accent-foreground",
		"foreground",
		"field-placeholder",
		"background",
		"danger",
	]);
	const initialKey = useMemo(() => monthDayYearToCalendarKey(value), [value]);
	const todayKey = useMemo(() => dateToCalendarKey(new Date()), []);

	// When the modal opens, seed the pending selection from the current value
	// (or today if empty).
	useEffect(() => {
		if (open) {
			setPendingKey(initialKey ?? todayKey);
		}
	}, [open, initialKey, todayKey]);

	const pendingDate = useMemo(
		() => (pendingKey ? parseCalendarKey(pendingKey) : new Date()),
		[pendingKey],
	);

	const minDate = minimumDate ? dateToCalendarKey(minimumDate) : undefined;
	const maxDate = maximumDate ? dateToCalendarKey(maximumDate) : undefined;

	const calendarTheme = useMemo(
		() => ({
			backgroundColor: background,
			calendarBackground: background,
			textSectionTitleColor: placeholderColor,
			selectedDayBackgroundColor: accent,
			selectedDayTextColor: accentForeground,
			todayTextColor: accent,
			dayTextColor: foreground,
			textDisabledColor: placeholderColor,
			arrowColor: foreground,
			monthTextColor: foreground,
			indicatorColor: accent,
			textDayFontWeight: "400" as const,
			textMonthFontWeight: "600" as const,
			textDayHeaderFontWeight: "500" as const,
		}),
		[accent, accentForeground, background, foreground, placeholderColor],
	);

	const markedDates = pendingKey
		? {
				[pendingKey]: {
					selected: true,
					selectedColor: accent,
					selectedTextColor: accentForeground,
				},
			}
		: undefined;

	const handleDayPress = (day: DateData) => {
		setPendingKey(day.dateString);
	};

	const handleConfirm = () => {
		if (!pendingKey) return;
		const formatted = calendarKeyToMonthDayYear(pendingKey);
		if (!formatted) return;
		onChange(formatted);
		setOpen(false);
	};

	const handleCancel = () => {
		setOpen(false);
	};

	return (
		<>
			<Pressable
				onPress={() => setOpen(true)}
				accessibilityRole="button"
				accessibilityLabel={value ? `Selected date ${value}` : placeholder}
				className={`h-12 flex-row items-center rounded-2xl border bg-background px-3 active:opacity-90 ${
					invalid ? "border-destructive" : "border-border"
				}`}
				style={invalid ? { borderColor: destructive } : undefined}
			>
				<Text
					className={`flex-1 text-base ${
						value ? "text-foreground" : "text-muted-foreground"
					}`}
				>
					{value || placeholder}
				</Text>
				<Ionicons name="calendar-outline" size={20} color={accent} />
			</Pressable>

			<Modal
				visible={open}
				transparent
				animationType="fade"
				statusBarTranslucent
				onRequestClose={handleCancel}
			>
				<Pressable
					className="flex-1 items-center justify-center bg-overlay px-6"
					onPress={handleCancel}
				>
					<Pressable
						className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-border bg-background"
						onPress={(e) => e.stopPropagation()}
						style={{
							shadowColor: foreground,
							shadowOpacity: 0.18,
							shadowRadius: 16,
							shadowOffset: { width: 0, height: 8 },
							elevation: 6,
						}}
					>
						{/* Teal header */}
						<View
							className="px-6 pt-5 pb-6"
							style={{ backgroundColor: accent }}
						>
							<Text
								className="text-sm"
								style={{ color: accentForeground, opacity: 0.85 }}
							>
								{pendingDate.getFullYear()}
							</Text>
							<Text
								className="mt-1 font-semibold text-3xl"
								style={{ color: accentForeground }}
							>
								{formatHeaderLabel(pendingDate)}
							</Text>
						</View>

						{/* Calendar grid */}
						<View className="px-2 pt-2">
							<Calendar
								key={pendingKey ?? todayKey}
								current={pendingKey ?? todayKey}
								onDayPress={handleDayPress}
								markedDates={markedDates}
								minDate={minDate}
								maxDate={maxDate}
								firstDay={1}
								theme={calendarTheme}
								enableSwipeMonths
								hideExtraDays
							/>
						</View>

						{/* Cancel / OK */}
						<View className="flex-row items-center justify-end gap-1 px-3 pt-1 pb-3">
							<Pressable
								onPress={handleCancel}
								accessibilityRole="button"
								accessibilityLabel="Cancel"
								className="rounded-md px-4 py-2 active:opacity-70"
								hitSlop={6}
							>
								<Text
									className="font-semibold text-sm tracking-wide"
									style={{ color: accent }}
								>
									CANCEL
								</Text>
							</Pressable>
							<Pressable
								onPress={handleConfirm}
								accessibilityRole="button"
								accessibilityLabel="OK"
								className="rounded-md px-4 py-2 active:opacity-70"
								hitSlop={6}
							>
								<Text
									className="font-semibold text-sm tracking-wide"
									style={{ color: accent }}
								>
									OK
								</Text>
							</Pressable>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</>
	);
}
