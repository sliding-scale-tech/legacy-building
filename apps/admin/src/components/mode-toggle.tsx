import { Button } from "@legacy-building/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@legacy-building/ui/components/dropdown-menu";
import { cn } from "@legacy-building/ui/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ModeToggleProps = {
	variant?: "default" | "header";
};

export function ModeToggle({ variant = "default" }: ModeToggleProps) {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button
				variant="outline"
				size="icon"
				className="size-9 shrink-0"
				aria-hidden
				disabled
			/>
		);
	}

	const isDark = resolvedTheme === "dark";

	const triggerButton = (
		<Button
			type="button"
			variant="outline"
			size="icon"
			className={cn(
				"relative size-9 shrink-0",
				variant === "header" &&
					"border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white",
			)}
			aria-label="Toggle theme"
		>
			{isDark ? (
				<Moon className="size-[1.15rem]" aria-hidden />
			) : (
				<Sun className="size-[1.15rem]" aria-hidden />
			)}
		</Button>
	);

	return (
		<div className="relative shrink-0">
			<DropdownMenu>
				<DropdownMenuTrigger render={triggerButton} />
				<DropdownMenuContent
					align="end"
					side="bottom"
					sideOffset={10}
					className="w-auto min-w-[9.5rem] rounded-xl p-1 shadow-lg"
				>
					<DropdownMenuItem onClick={() => setTheme("light")}>
						<span className={theme === "light" ? "font-semibold" : undefined}>
							Light
						</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("dark")}>
						<span className={theme === "dark" ? "font-semibold" : undefined}>
							Dark
						</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("system")}>
						<span className={theme === "system" ? "font-semibold" : undefined}>
							System
						</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
