import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Camera } from "lucide-react";
import { useRef } from "react";
import { uploadedImageFitClass } from "@/components/journal/library/libraryFormStyles";

type EntryImageUploadProps = {
	accentColor: string;
	imagePreview: string | null;
	invalid?: boolean;
	onFileChange: (
		e: React.ChangeEvent<HTMLInputElement>,
	) => void | Promise<void>;
};

/** Bubble PictureInput: 265×200px tile, centered camera icon only. */
export function EntryImageUpload({
	accentColor,
	imagePreview,
	invalid,
	onFileChange,
}: EntryImageUploadProps) {
	const imageRef = useRef<HTMLInputElement>(null);
	const iconColor = accentColor || brand.primary;

	return (
		<div className="relative w-[265px] max-w-full self-start">
			<button
				type="button"
				onClick={() => imageRef.current?.click()}
				className={cn(
					"relative flex h-[200px] w-[265px] max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border bg-white p-3",
					invalid ? "border-[#b0200c]" : "border-[#c7c7c7]",
				)}
				aria-label="Upload image"
				aria-invalid={invalid}
			>
				{imagePreview ? (
					<img
						src={imagePreview}
						alt="Entry preview"
						decoding="async"
						className={cn("absolute inset-0", uploadedImageFitClass)}
					/>
				) : (
					<Camera
						className="size-[30px] shrink-0"
						style={{ color: iconColor }}
						strokeWidth={1.75}
						aria-hidden
					/>
				)}
			</button>
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
