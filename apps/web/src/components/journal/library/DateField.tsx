import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/journal/ui/button";
import { Calendar } from "@/components/journal/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/journal/ui/popover";
import { formatDate } from "@/lib/journal/formatDate";

type DateFieldProps = {
	value: Date | undefined;
	onChange: (date: Date | undefined) => void;
	invalid?: boolean;
	className?: string;
	popoverClassName?: string;
};

function toDisplayDate(date: Date): string {
	return formatDate(date.getTime());
}

export function DateField({
	value,
	onChange,
	invalid,
	className,
	popoverClassName,
}: DateFieldProps) {
	const [open, setOpen] = useState(false);

	const placeholder = useMemo(() => toDisplayDate(new Date()), []);

	const display = value !== undefined ? toDisplayDate(value) : "";
	const emptyLabel = invalid && !display ? "Select date" : placeholder;

	const handleSelect = (date: Date | undefined) => {
		onChange(date);
		if (date !== undefined) {
			setOpen(false);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					aria-expanded={open}
					aria-haspopup="dialog"
					className={cn(
						"h-11 max-h-11 w-full min-w-0 justify-start rounded-[12px] border bg-white px-3 text-left font-normal text-sm shadow-none hover:bg-white focus-visible:ring-0",
						!display && "text-[#8a8a8a]",
						display && "text-[#1a1a1a]",
						className,
					)}
					style={{
						borderColor: invalid ? brand.destructive : brand.border,
					}}
				>
					<span className="min-w-0 flex-1 truncate">
						{display || emptyLabel}
					</span>
					<CalendarIcon className="size-4 shrink-0 opacity-0" aria-hidden />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				side="bottom"
				sideOffset={4}
				collisionPadding={12}
				className={cn(
					"z-[2100] w-auto min-w-[280px] max-w-[320px] border border-[#e6e6e6] bg-white p-0 text-[#1a1a1a] shadow-lg ring-0",
					popoverClassName,
				)}
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<Calendar
					mode="single"
					selected={value}
					onSelect={handleSelect}
					defaultMonth={value ?? new Date()}
					className="w-full min-w-[280px]"
					classNames={{
						root: "w-full min-w-[280px]",
						months: "w-full",
						month: "w-full gap-2",
						month_caption: "mb-1 h-9",
						nav: "absolute inset-x-0 top-0",
						button_previous: "text-[#1a1a1a] hover:bg-[#ebf6f6]",
						button_next: "text-[#1a1a1a] hover:bg-[#ebf6f6]",
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
