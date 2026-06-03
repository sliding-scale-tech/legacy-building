"use client";

import { cn } from "@legacy-building/ui/lib/utils";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import * as React from "react";
import {
	type DayButton,
	DayPicker,
	getDefaultClassNames,
	type Locale,
} from "react-day-picker";
import { Button, buttonVariants } from "@/components/journal/ui/button";

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "label",
	buttonVariant = "ghost",
	locale,
	formatters,
	components,
	...props
}: React.ComponentProps<typeof DayPicker> & {
	buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
	const defaultClassNames = getDefaultClassNames();

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn(
				"group/calendar w-full min-w-[280px] bg-white p-3 [--cell-radius:0.5rem]",
				String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
				String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
				className,
			)}
			captionLayout={captionLayout}
			locale={locale}
			formatters={{
				formatMonthDropdown: (date) =>
					date.toLocaleString(locale?.code, { month: "short" }),
				...formatters,
			}}
			classNames={{
				root: cn("w-fit", defaultClassNames.root),
				months: cn(
					"relative flex flex-col gap-4 md:flex-row",
					defaultClassNames.months,
				),
				month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
				nav: cn(
					"absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
					defaultClassNames.nav,
				),
				button_previous: cn(
					buttonVariants({ variant: buttonVariant }),
					"size-9 shrink-0 select-none p-0 text-[#1a1a1a] aria-disabled:opacity-50",
					defaultClassNames.button_previous,
				),
				button_next: cn(
					buttonVariants({ variant: buttonVariant }),
					"size-9 shrink-0 select-none p-0 text-[#1a1a1a] aria-disabled:opacity-50",
					defaultClassNames.button_next,
				),
				month_caption: cn(
					"flex h-9 w-full items-center justify-center px-9",
					defaultClassNames.month_caption,
				),
				dropdowns: cn(
					"flex h-9 w-full items-center justify-center gap-1.5 font-medium text-sm",
					defaultClassNames.dropdowns,
				),
				dropdown_root: cn(
					"relative rounded-(--cell-radius)",
					defaultClassNames.dropdown_root,
				),
				dropdown: cn(
					"absolute inset-0 bg-popover opacity-0",
					defaultClassNames.dropdown,
				),
				caption_label: cn(
					"select-none font-semibold text-[#1a1a1a]",
					captionLayout === "label"
						? "text-sm"
						: "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-[#8a8a8a]",
					defaultClassNames.caption_label,
				),
				weekdays: cn(
					"grid w-full grid-cols-7 gap-0",
					defaultClassNames.weekdays,
				),
				weekday: cn(
					"flex h-9 w-full min-w-9 select-none items-center justify-center font-medium text-[#8a8a8a] text-[0.75rem]",
					defaultClassNames.weekday,
				),
				week: cn("mt-1 grid w-full grid-cols-7 gap-0", defaultClassNames.week),
				week_number_header: cn(
					"w-(--cell-size) select-none",
					defaultClassNames.week_number_header,
				),
				week_number: cn(
					"select-none text-[0.8rem] text-muted-foreground",
					defaultClassNames.week_number,
				),
				day: cn(
					"group/day relative flex h-9 w-full min-w-9 select-none items-center justify-center p-0",
					defaultClassNames.day,
				),
				range_start: cn(
					"relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
					defaultClassNames.range_start,
				),
				range_middle: cn("rounded-none", defaultClassNames.range_middle),
				range_end: cn(
					"relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
					defaultClassNames.range_end,
				),
				today: cn(
					"rounded-(--cell-radius) bg-[#ebf6f6] text-[#1a1a1a]",
					defaultClassNames.today,
				),
				outside: cn(
					"text-[#c7c7c7] aria-selected:text-[#c7c7c7]",
					defaultClassNames.outside,
				),
				disabled: cn("text-[#c7c7c7] opacity-50", defaultClassNames.disabled),
				hidden: cn("invisible", defaultClassNames.hidden),
				...classNames,
			}}
			components={{
				Root: ({ className, rootRef, ...props }) => {
					return (
						<div
							data-slot="calendar"
							ref={rootRef}
							className={cn(className)}
							{...props}
						/>
					);
				},
				Chevron: ({ className, orientation, ...props }) => {
					if (orientation === "left") {
						return (
							<ChevronLeftIcon className={cn("size-4", className)} {...props} />
						);
					}

					if (orientation === "right") {
						return (
							<ChevronRightIcon
								className={cn("size-4", className)}
								{...props}
							/>
						);
					}

					return (
						<ChevronDownIcon className={cn("size-4", className)} {...props} />
					);
				},
				DayButton: ({ ...props }) => (
					<CalendarDayButton locale={locale} {...props} />
				),
				WeekNumber: ({ children, ...props }) => {
					return (
						<td {...props}>
							<div className="flex size-9 items-center justify-center text-center">
								{children}
							</div>
						</td>
					);
				},
				...components,
			}}
			{...props}
		/>
	);
}

function CalendarDayButton({
	className,
	day,
	modifiers,
	locale,
	...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
	const defaultClassNames = getDefaultClassNames();

	const ref = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<Button
			ref={ref}
			variant="ghost"
			size="icon"
			data-day={day.date.toLocaleDateString(locale?.code)}
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			className={cn(
				"size-9 min-h-9 min-w-9 rounded-(--cell-radius) border-0 font-normal text-[#1a1a1a] text-sm leading-none hover:bg-[#ebf6f6] hover:text-[#1a1a1a]",
				"data-[selected-single=true]:bg-[#008080] data-[selected-single=true]:text-white data-[selected-single=true]:hover:bg-[#006b6b] data-[selected-single=true]:hover:text-white",
				"group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-[#008080]/40",
				defaultClassNames.day,
				className,
			)}
			{...props}
		/>
	);
}

export { Calendar, CalendarDayButton };
