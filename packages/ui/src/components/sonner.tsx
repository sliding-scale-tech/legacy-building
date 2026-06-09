import { Loader2Icon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Bubble.io toast: white pill, teal text, top-right, no icon. */
const bubbleToastClassNames = {
	toast:
		"flex w-auto min-w-[120px] items-center justify-center rounded-[3px] border-0 bg-white px-5 py-2.5 shadow-[0_2px_6px_rgba(0,0,0,0.15)]",
	title: "text-center font-normal text-[#008080] text-base leading-[1.4]",
	description: "text-center font-normal text-[#008080] text-sm leading-[1.4]",
	content: "flex items-center justify-center",
	icon: "hidden",
	closeButton: "hidden",
} as const;

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="light"
			position="top-right"
			richColors={false}
			closeButton={false}
			className="toaster group"
			icons={{
				success: null,
				info: null,
				warning: null,
				error: null,
				loading: <Loader2Icon className="size-4 animate-spin text-[#008080]" />,
			}}
			toastOptions={{
				unstyled: true,
				classNames: bubbleToastClassNames,
			}}
			{...props}
		/>
	);
};

export { Toaster };
