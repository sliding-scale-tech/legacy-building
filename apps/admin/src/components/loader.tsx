import { Loader2 } from "lucide-react";

export default function Loader() {
	return (
		<div className="flex h-full min-h-[40svh] items-center justify-center">
			<Loader2
				className="size-6 animate-spin text-muted-foreground"
				aria-hidden
			/>
			<span className="sr-only">Loading</span>
		</div>
	);
}
