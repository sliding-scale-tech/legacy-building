import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { useMutation } from "convex/react";
import { Camera, ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AudioRecorderField } from "@/components/journal/library/AudioRecorderField";
import { DateField } from "@/components/journal/library/DateField";
import {
	accentForMode,
	fieldInputClass,
	fieldLabelClass,
	fieldTextareaClass,
} from "@/components/journal/library/libraryFormStyles";
import { SidebarEditActions } from "@/components/journal/library/SidebarEditActions";
import { Button } from "@/components/journal/ui/button";
import { Input } from "@/components/journal/ui/input";
import { Textarea } from "@/components/journal/ui/textarea";
import {
	type EnrichedJournalEntry,
	entryAccentColor,
} from "@/lib/journal/journalEntryTypes";
import {
	messageFromUnknownError,
	toastMutationError,
	toastMutationSuccess,
} from "@/lib/journal/toast";
import { uploadToStorage } from "@/lib/journal/uploadToStorage";

type EditJournalEntrySidebarFormProps = {
	entry: EnrichedJournalEntry;
	onCancel: () => void;
	onSaved?: () => void;
};

export function EditJournalEntrySidebarForm({
	entry,
	onCancel,
	onSaved,
}: EditJournalEntrySidebarFormProps) {
	const formId = useId();
	const imageRef = useRef<HTMLInputElement>(null);
	const updateEntry = useMutation(api.journal.entries.mutations.update);
	const generateUploadUrl = useMutation(
		api.journal.mutations.generateUploadUrl,
	);

	const mode = entry.mode;
	const accent = entryAccentColor(mode);

	const [title, setTitle] = useState(entry.title);
	const [date, setDate] = useState<Date | undefined>(
		() => new Date(entry.dateMs),
	);
	const [body, setBody] = useState(entry.body ?? "");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(
		entry.imageUrl ?? null,
	);
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [hasExistingAudio, setHasExistingAudio] = useState(
		Boolean(entry.audioId),
	);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showErrors, setShowErrors] = useState(false);

	useEffect(() => {
		setTitle(entry.title);
		setDate(new Date(entry.dateMs));
		setBody(entry.body ?? "");
		setImageFile(null);
		setImagePreview(entry.imageUrl ?? null);
		setAudioFile(null);
		setHasExistingAudio(Boolean(entry.audioId));
		setError(null);
		setShowErrors(false);
		if (imageRef.current) imageRef.current.value = "";
	}, [entry.title, entry.dateMs, entry.body, entry.imageUrl, entry.audioId]);

	const titleInvalid = !title.trim();
	const dateInvalid = date === undefined;
	const bodyInvalid = mode === "writing" && !body.trim();
	const audioInvalid =
		mode === "recording" && !hasExistingAudio && audioFile === null;
	const imageInvalid = !imageFile && !imagePreview;
	const isValid =
		!titleInvalid &&
		!dateInvalid &&
		!imageInvalid &&
		(mode === "writing" ? !bodyInvalid : !audioInvalid);

	const handleCancel = useCallback(() => {
		if (imagePreview?.startsWith("blob:")) {
			URL.revokeObjectURL(imagePreview);
		}
		onCancel();
	}, [onCancel, imagePreview]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") handleCancel();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handleCancel]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (imagePreview?.startsWith("blob:")) {
			URL.revokeObjectURL(imagePreview);
		}
		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
	};

	const handleSave = async () => {
		setShowErrors(true);
		if (!isValid) return;

		setSubmitting(true);
		setError(null);
		try {
			let imageId: Id<"_storage"> | undefined;
			if (imageFile) {
				imageId = await uploadToStorage(
					imageFile,
					() => generateUploadUrl(),
					imageFile.type || "image/jpeg",
				);
			}

			let audioId: Id<"_storage"> | undefined;
			if (mode === "recording" && audioFile) {
				audioId = await uploadToStorage(
					audioFile,
					() => generateUploadUrl(),
					audioFile.type || "audio/webm",
				);
			}

			await updateEntry({
				id: entry._id,
				title: title.trim(),
				dateMs: date.getTime(),
				body: mode === "writing" ? body.trim() : undefined,
				imageId,
				audioId,
			});
			toastMutationSuccess("Entry updated.");
			onSaved?.();
			onCancel();
		} catch (err) {
			const message = messageFromUnknownError(
				err,
				"Could not update entry. Please try again.",
			);
			setError(message);
			toastMutationError(err, message);
		} finally {
			setSubmitting(false);
		}
	};

	const heading =
		mode === "writing" ? "Edit your story" : "Edit your recording";

	return (
		<form
			id={formId}
			className="flex min-h-0 flex-1 flex-col overflow-hidden"
			onSubmit={(e) => {
				e.preventDefault();
				void handleSave();
			}}
		>
			<div className="relative min-h-[140px] shrink-0">
				<button
					type="button"
					onClick={() => imageRef.current?.click()}
					className={cn(
						"relative flex min-h-[140px] w-full cursor-pointer items-center justify-center overflow-hidden bg-white",
						showErrors && imageInvalid
							? "ring-2 ring-[#b0200c] ring-inset"
							: "",
					)}
				>
					{imagePreview ? (
						<img
							src={imagePreview}
							alt="Entry preview"
							className="absolute inset-0 size-full object-cover"
						/>
					) : null}
					<span
						className="pointer-events-none absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-white shadow-sm"
						aria-hidden
					>
						<Camera
							className="size-4"
							style={{ color: accent }}
							strokeWidth={2}
						/>
					</span>
				</button>
				<input
					ref={imageRef}
					type="file"
					accept="image/*"
					className="sr-only"
					onChange={handleImageChange}
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={handleCancel}
					className="absolute top-2.5 left-2.5 size-[30px] rounded bg-white p-[5px] hover:bg-white hover:opacity-80"
					aria-label="Cancel editing"
				>
					<ChevronLeft
						className="size-5"
						style={{ color: accent }}
						strokeWidth={2}
					/>
				</Button>
			</div>

			<div
				className="library-modal-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-3 py-4"
				style={{ backgroundColor: brand.entryDetailPanelBg }}
			>
				<h2 className="font-semibold text-[#1a1a1a] text-base leading-[1.4]">
					{heading}
				</h2>

				<div className="flex flex-col gap-1">
					<label htmlFor={`${formId}-title`} className={fieldLabelClass}>
						Title
					</label>
					<Input
						id={`${formId}-title`}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className={fieldInputClass(showErrors && titleInvalid)}
						aria-invalid={showErrors && titleInvalid}
					/>
				</div>

				<div className="flex flex-col gap-1">
					<span className={fieldLabelClass}>Date</span>
					<DateField
						value={date}
						onChange={setDate}
						invalid={showErrors && dateInvalid}
						popoverClassName="z-[1600]"
					/>
				</div>

				{mode === "writing" ? (
					<div className="flex flex-col gap-1">
						<label htmlFor={`${formId}-body`} className={fieldLabelClass}>
							Entry Log
						</label>
						<Textarea
							id={`${formId}-body`}
							value={body}
							onChange={(e) => setBody(e.target.value)}
							className={fieldTextareaClass(showErrors && bodyInvalid)}
							aria-invalid={showErrors && bodyInvalid}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-1">
						<span className={fieldLabelClass}>Recording</span>
						<AudioRecorderField
							accentColor={accentForMode(mode)}
							value={audioFile}
							onChange={(file) => {
								setAudioFile(file);
								if (file) setHasExistingAudio(true);
							}}
							invalid={showErrors && audioInvalid}
						/>
						{hasExistingAudio && !audioFile ? (
							<p className="text-[#525252] text-xs">
								Current recording is kept unless you record or upload a new one.
							</p>
						) : null}
					</div>
				)}

				{showErrors && !isValid ? (
					<p className="text-[#b0200c] text-sm" role="alert">
						Please fill in all fields before saving.
					</p>
				) : null}

				{error ? (
					<p className="text-[#b0200c] text-sm" role="alert">
						{error}
					</p>
				) : null}
			</div>

			<SidebarEditActions
				onCancel={handleCancel}
				submitting={submitting}
				accentColor={accent}
			/>
		</form>
	);
}
