import { cn } from "@legacy-building/ui/lib/utils";
import { Minus, X } from "lucide-react";

type CalendarFooterProps = {
	onToday: () => void;
	onClear: () => void;
	onClose: () => void;
	className?: string;
};

function SelectionCornerMark({ className }: { className?: string }) {
	return (
		<span
			className={cn(
				"inline-block size-0 border-t-[#6eb5e0] border-t-[7px] border-r-[7px] border-r-transparent",
				className,
			)}
			aria-hidden
		/>
	);
}

export function CalendarFooter({
	onToday,
	onClear,
	onClose,
	className,
}: CalendarFooterProps) {
	const actionClass =
		"flex flex-1 items-center justify-center gap-1.5 py-3 font-semibold text-[#1a1a1a] text-sm transition-colors hover:bg-[#f7f7f7]";

	return (
		<div
			className={cn(
				"grid grid-cols-3 border-[#e8e8e8] border-t bg-white",
				className,
			)}
		>
			<button type="button" className={actionClass} onClick={onToday}>
				<SelectionCornerMark />
				Today
			</button>
			<button type="button" className={actionClass} onClick={onClear}>
				<Minus
					className="size-3.5 text-[#d64545]"
					strokeWidth={3}
					aria-hidden
				/>
				Clear
			</button>
			<button type="button" className={actionClass} onClick={onClose}>
				<X className="size-3.5 text-[#9a9a9a]" strokeWidth={2.5} aria-hidden />
				Close
			</button>
		</div>
	);
}
