import { Input } from "@legacy-building/ui/components/input";
import { cn } from "@legacy-building/ui/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { forwardRef, useState } from "react";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	function PasswordInput({ className, ...props }, ref) {
		const [visible, setVisible] = useState(false);
		return (
			<div className="relative">
				<Input
					{...props}
					ref={ref}
					type={visible ? "text" : "password"}
					className={cn("pr-12", className)}
				/>
				<button
					type="button"
					onClick={() => setVisible((v) => !v)}
					aria-label={visible ? "Hide password" : "Show password"}
					className="absolute top-1/2 right-4 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
				>
					{visible ? (
						<EyeOffIcon className="size-4" aria-hidden />
					) : (
						<EyeIcon className="size-4" aria-hidden />
					)}
				</button>
			</div>
		);
	},
);
