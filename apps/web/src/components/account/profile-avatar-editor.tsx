import { api } from "@legacy-building/backend/convex/_generated/api";
import { cn } from "@legacy-building/ui/lib/utils";
import { useMutation } from "convex/react";
import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { Avatar, AvatarImage } from "@/components/journal/ui/avatar";
import { uploadProfilePicture } from "@/lib/account/uploadProfilePicture";
import {
	messageFromUnknownError,
	toastMutationError,
	toastMutationSuccess,
} from "@/lib/journal/toast";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ProfileAvatarEditorProps = {
	src: string;
	hasCustomPhoto: boolean;
	/** Desk hero: large circle with cover crop; account page no longer uses this. */
	variant?: "desk";
};

export function ProfileAvatarEditor({
	src,
	hasCustomPhoto,
	variant = "desk",
}: ProfileAvatarEditorProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const generateUploadUrl = useMutation(
		api.user.mutations.generateProfilePictureUploadUrl,
	);
	const setProfilePicture = useMutation(api.user.mutations.setProfilePicture);
	const removeProfilePicture = useMutation(
		api.user.mutations.removeProfilePicture,
	);
	const [uploading, setUploading] = useState(false);
	const [removing, setRemoving] = useState(false);

	const busy = uploading || removing;

	const validateFile = (file: File): string | null => {
		if (!ACCEPTED_TYPES.includes(file.type)) {
			return "Please choose a JPEG, PNG, WebP, or GIF image.";
		}
		if (file.size > MAX_BYTES) {
			return "Image must be 5 MB or smaller.";
		}
		return null;
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		const validationError = validateFile(file);
		if (validationError) {
			toastMutationError(new Error(validationError), validationError);
			return;
		}

		setUploading(true);
		try {
			const storageId = await uploadProfilePicture(file, () =>
				generateUploadUrl(),
			);
			await setProfilePicture({ storageId });
			toastMutationSuccess("Profile photo updated.");
		} catch (err) {
			toastMutationError(
				err,
				messageFromUnknownError(
					err,
					"Could not upload profile photo. Please try again.",
				),
			);
		} finally {
			setUploading(false);
		}
	};

	const handleRemove = async () => {
		setRemoving(true);
		try {
			await removeProfilePicture({});
			toastMutationSuccess("Profile photo removed.");
		} catch (err) {
			toastMutationError(
				err,
				messageFromUnknownError(
					err,
					"Could not remove profile photo. Please try again.",
				),
			);
		} finally {
			setRemoving(false);
		}
	};

	const isDesk = variant === "desk";

	return (
		<div
			className={cn(
				"flex flex-col items-center",
				isDesk ? "gap-0" : "gap-2 sm:items-start",
			)}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept={ACCEPTED_TYPES.join(",")}
				className="sr-only"
				onChange={(e) => void handleFileChange(e)}
			/>
			<button
				type="button"
				disabled={busy}
				onClick={() => fileInputRef.current?.click()}
				className={cn(
					"group relative shrink-0 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080] focus-visible:ring-offset-2",
					busy && "cursor-wait",
				)}
				aria-label="Change profile photo"
			>
				<Avatar
					className={cn(
						isDesk
							? "size-[clamp(9.5rem,40vw,12.5rem)] md:size-[clamp(7.5rem,32vw,12.5rem)]"
							: "size-[clamp(7.5rem,32vw,12.5rem)]",
						"border-[#008080] bg-white",
						"border-[3px] sm:border-4 md:border-[5px]",
						"after:border-0",
					)}
				>
					<AvatarImage
						src={src}
						alt="Profile"
						className="size-full object-cover object-center"
					/>
				</Avatar>
				<span
					className={cn(
						"absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full",
						"bg-[rgba(0,0,0,0.45)] text-white opacity-0 transition-opacity",
						"group-hover:opacity-100 group-focus-visible:opacity-100",
						busy && "opacity-100",
					)}
				>
					{uploading ? (
						<Loader2 className="size-8 animate-spin" aria-hidden />
					) : (
						<>
							<Camera className="size-7" aria-hidden />
							{!isDesk ? (
								<span className="font-medium text-xs">Change photo</span>
							) : null}
						</>
					)}
				</span>
			</button>
			{!isDesk ? (
				<>
					<p className="text-center text-[#737373] text-xs sm:text-left">
						Click the photo to upload. JPEG, PNG, WebP, or GIF · max 5 MB.
					</p>
					{hasCustomPhoto ? (
						<button
							type="button"
							disabled={busy}
							onClick={() => void handleRemove()}
							className="text-[#008080] text-sm underline-offset-2 hover:underline disabled:opacity-50"
						>
							{removing ? "Removing…" : "Remove photo"}
						</button>
					) : null}
				</>
			) : null}
		</div>
	);
}
