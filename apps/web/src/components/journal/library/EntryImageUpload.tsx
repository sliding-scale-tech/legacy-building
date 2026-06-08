import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Camera } from "lucide-react";
import { useRef } from "react";

type EntryImageUploadProps = {
	accentColor: string;
	imagePreview: string | null;
	invalid?: boolean;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

/** Bubble PictureInput: min 265×200, 12px radius, centered camera icon. */
export function EntryImageUpload({
	accentColor,
	imagePreview,
	invalid,
	onFileChange,
}: EntryImageUploadProps) {
	const imageRef = useRef<HTMLInputElement>(null);

	return (
		<div className="relative w-full min-w-0">
			<button
				type="button"
				onClick={() => imageRef.current?.click()}
				className={cn(
					"relative flex min-h-[200px] w-full min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border bg-white",
					invalid ? "border-[#b0200c]" : "border-[#c7c7c7]",
				)}
				aria-invalid={invalid}
			>
				{imagePreview ? (
					<img
						src={imagePreview}
						alt="Entry preview"
						className="absolute inset-0 size-full object-contain p-3"
					/>
				) : null}
			</button>
			{!imagePreview ? (
				<span
					className="pointer-events-none absolute top-1/2 left-1/2 flex size-[30px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
					aria-hidden
				>
					<Camera
						className="size-[30px]"
						style={{ color: accentColor || brand.primary }}
						strokeWidth={1.75}
					/>
				</span>
			) : null}
			<input
				ref={imageRef}
				type="file"
				accept="image/*"
				className="sr-only"
				onChange={onFileChange}
			/>
		</div>
	);
}
