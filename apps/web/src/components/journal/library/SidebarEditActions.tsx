import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Button } from "@/components/journal/ui/button";

type SidebarEditActionsProps = {
	onCancel: () => void;
	submitting?: boolean;
	disabled?: boolean;
	accentColor?: string;
	className?: string;
};

export function SidebarEditActions({
	onCancel,
	submitting = false,
	disabled = false,
	accentColor = brand.primary,
	className,
}: SidebarEditActionsProps) {
	return (
		<div
			className={cn(
				"flex shrink-0 gap-3 border-[#e5e5e5] border-t bg-white px-3 py-4",
				className,
			)}
		>
			<Button
				type="button"
				onClick={onCancel}
				disabled={submitting}
				className="min-h-10 flex-1 rounded-xl bg-[var(--lb-cancel-bg)] px-3 font-medium text-[var(--lb-cancel-text)] text-sm leading-[1.4] hover:opacity-90"
			>
				Cancel
			</Button>
			<Button
				type="submit"
				disabled={submitting || disabled}
				className="min-h-10 flex-1 rounded-xl px-3 font-medium text-sm text-white leading-[1.4] hover:opacity-95"
				style={{ backgroundColor: accentColor }}
			>
				{submitting ? "Saving…" : "Save"}
			</Button>
		</div>
	);
}
