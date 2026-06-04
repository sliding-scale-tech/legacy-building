import { api } from "@legacy-building/backend/convex/_generated/api";
import { Input } from "@legacy-building/ui/components/input";
import { cn } from "@legacy-building/ui/lib/utils";
import { useQuery } from "convex/react";
import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type UsersSearchFieldProps = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
	className?: string;
};

export function UsersSearchField({
	value,
	onChange,
	onSubmit,
	className,
}: UsersSearchFieldProps) {
	const listId = useId();
	const [open, setOpen] = useState(false);
	const [debouncedQuery, setDebouncedQuery] = useState(value);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = window.setTimeout(() => setDebouncedQuery(value), 280);
		return () => window.clearTimeout(timer);
	}, [value]);

	const suggestions = useQuery(
		api.admin.queries.searchUserSuggestions,
		debouncedQuery.trim().length >= 2 ? { query: debouncedQuery } : "skip",
	);

	const showSuggestions =
		open &&
		debouncedQuery.trim().length >= 2 &&
		suggestions !== undefined &&
		suggestions.length > 0;

	useEffect(() => {
		const onPointerDown = (event: MouseEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, []);

	const pickSuggestion = (email: string) => {
		onChange(email);
		onSubmit(email);
		setOpen(false);
	};

	return (
		<div
			ref={containerRef}
			className={cn("relative min-w-[200px] flex-1", className)}
		>
			<Search
				className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden
			/>
			<Input
				role="combobox"
				aria-expanded={showSuggestions}
				aria-controls={listId}
				aria-autocomplete="list"
				placeholder="Search name or email"
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						onSubmit(value.trim());
						setOpen(false);
					}
					if (e.key === "Escape") {
						setOpen(false);
					}
				}}
				className="h-11 rounded-xl pr-9 pl-9"
			/>
			{value ? (
				<button
					type="button"
					className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					aria-label="Clear search"
					onClick={() => {
						onChange("");
						onSubmit("");
						setOpen(false);
					}}
				>
					<X className="size-4" aria-hidden />
				</button>
			) : null}

			{showSuggestions ? (
				<div
					id={listId}
					role="listbox"
					className="absolute top-[calc(100%+6px)] z-20 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg"
				>
					{suggestions.map((user) => (
						<button
							key={user._id}
							type="button"
							role="option"
							className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
							onClick={() => pickSuggestion(user.email)}
						>
							<span className="font-medium">{user.name}</span>
							<span className="text-muted-foreground text-xs">
								{user.email}
							</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
