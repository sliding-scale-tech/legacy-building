import { Ionicons } from "@expo/vector-icons";
import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { router, useLocalSearchParams } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AudioRecorderField } from "@/components/library/audio-recorder-field";
import { DateField } from "@/components/library/date-field";
import {
	type EntryMode,
	EntryModeTabs,
} from "@/components/library/entry-mode-tabs";
import { formatDateLong } from "@/lib/journal/formatDate";
import { parseMonthDayYear } from "@/lib/journal/parse-date";
import {
	type PickedEntryImage,
	pickEntryImageFromCamera,
	pickEntryImageFromLibrary,
} from "@/lib/journal/pick-entry-image";
import { uploadBinaryToConvex } from "@/lib/journal/upload-binary";
import { useMutationToast } from "@/lib/mutation-toast";

function messageFromError(err: unknown, fallback: string): string {
	if (err instanceof ConvexError) {
		const data = err.data as { message?: string } | string | undefined;
		if (typeof data === "string") return data;
		if (data?.message) return data.message;
	}
	if (err instanceof Error) return err.message;
	return fallback;
}

export default function NewEntryScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ journalId?: string }>();
	const journalId = params.journalId as Id<"journals"> | undefined;

	const createEntry = useMutation(api.journal.entries.mutations.create);
	const generateUploadUrl = useMutation(
		api.journal.mutations.generateUploadUrl,
	);

	const mutationToast = useMutationToast();
	const [accent, accentForeground, foreground, placeholderColor] =
		useThemeColor([
			"accent",
			"accent-foreground",
			"foreground",
			"field-placeholder",
		]);

	const [mode, setMode] = useState<EntryMode>("writing");
	const [title, setTitle] = useState("");
	const [dateInput, setDateInput] = useState("");
	const [body, setBody] = useState("");
	const [image, setImage] = useState<PickedEntryImage | null>(null);
	const [audio, setAudio] = useState<{
		uri: string;
		mimeType: string;
		durationMs: number;
	} | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [showErrors, setShowErrors] = useState(false);

	const dateMs = useMemo(() => parseMonthDayYear(dateInput), [dateInput]);

	const handleCancel = () => {
		if (submitting) return;
		router.back();
	};

	const handlePickFromLibrary = useCallback(async () => {
		const picked = await pickEntryImageFromLibrary();
		if (picked.kind === "canceled") return;
		if (picked.kind === "permission-denied") {
			Alert.alert(
				"Photo access needed",
				"Allow photo access in Settings to attach a photo.",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Open Settings",
						onPress: () => void Linking.openSettings(),
					},
				],
			);
			return;
		}
		if (picked.kind === "error") {
			Alert.alert("Could not add photo", picked.message);
			return;
		}
		setImage(picked.image);
	}, []);

	const handleTakePhoto = useCallback(async () => {
		const picked = await pickEntryImageFromCamera();
		if (picked.kind === "canceled") return;
		if (picked.kind === "permission-denied") {
			Alert.alert(
				"Camera access needed",
				"Allow camera access in Settings to take a photo.",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Open Settings",
						onPress: () => void Linking.openSettings(),
					},
				],
			);
			return;
		}
		if (picked.kind === "error") {
			Alert.alert("Could not take photo", picked.message);
			return;
		}
		setImage(picked.image);
	}, []);

	const submit = useCallback(async () => {
		if (!journalId) return;
		setShowErrors(true);

		if (mode === "writing") {
			if (!title.trim() || dateMs === null || !body.trim()) return;
		} else if (!audio) {
			Alert.alert("No audio yet", "Tap the mic to record before saving.");
			return;
		}

		setSubmitting(true);
		try {
			let imageId: Id<"_storage"> | undefined;
			if (image) {
				imageId = await uploadBinaryToConvex({
					uri: image.uri,
					mimeType: image.mimeType,
					generateUploadUrl: () => generateUploadUrl(),
				});
			}

			let audioId: Id<"_storage"> | undefined;
			if (mode === "recording" && audio) {
				audioId = await uploadBinaryToConvex({
					uri: audio.uri,
					mimeType: audio.mimeType,
					generateUploadUrl: () => generateUploadUrl(),
				});
			}

			const entryTitle =
				mode === "recording" && !title.trim()
					? `Audio entry · ${formatDateLong(Date.now())}`
					: title.trim();
			const entryDateMs =
				mode === "recording" ? (dateMs ?? Date.now()) : (dateMs as number);

			await createEntry({
				journalId,
				title: entryTitle,
				dateMs: entryDateMs,
				body: mode === "writing" ? body.trim() : undefined,
				mode,
				imageId,
				audioId,
			});

			mutationToast.success("Entry saved!");
			router.back();
		} catch (err) {
			mutationToast.error(
				messageFromError(err, "Could not save entry. Please try again."),
			);
		} finally {
			setSubmitting(false);
		}
	}, [
		audio,
		body,
		createEntry,
		dateMs,
		generateUploadUrl,
		image,
		journalId,
		mode,
		mutationToast,
		title,
	]);

	const isRecordingMode = mode === "recording";

	return (
		<View
			className={`flex-1 ${isRecordingMode ? "bg-warning-soft" : "bg-secondary/30"}`}
		>
			{/* Teal header */}
			<View
				className="bg-primary px-4 pb-4"
				style={{ paddingTop: insets.top + 8 }}
			>
				<View className="h-10 flex-row items-center justify-between">
					<Pressable
						onPress={handleCancel}
						accessibilityRole="button"
						accessibilityLabel="Cancel"
						className="flex-row items-center gap-1 active:opacity-70"
						hitSlop={8}
					>
						<Ionicons name="chevron-back" size={22} color={accentForeground} />
						<Text className="font-medium text-base text-primary-foreground">
							Cancel
						</Text>
					</Pressable>

					{isRecordingMode ? (
						<Text className="font-semibold text-base text-primary-foreground">
							Audio Entries
						</Text>
					) : (
						<View />
					)}

					<Pressable
						onPress={() => void submit()}
						disabled={submitting}
						accessibilityRole="button"
						accessibilityLabel="Create entry"
						className="active:opacity-70"
						hitSlop={8}
					>
						{submitting ? (
							<ActivityIndicator color={accentForeground} />
						) : (
							<Text className="font-semibold text-base text-primary-foreground">
								Create
							</Text>
						)}
					</Pressable>
				</View>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1"
			>
				<ScrollView
					className="flex-1"
					contentContainerClassName="px-4 pt-6 pb-12 gap-5"
					keyboardShouldPersistTaps="handled"
				>
					<EntryModeTabs value={mode} onChange={setMode} />

					{mode === "writing" ? (
						<>
							<View className="gap-1.5">
								<Text className="font-semibold text-base text-foreground">
									Title
								</Text>
								<TextInput
									value={title}
									onChangeText={setTitle}
									placeholder=""
									placeholderTextColor={placeholderColor}
									className={`h-14 rounded-2xl border bg-background px-4 text-base text-foreground ${
										showErrors && !title.trim()
											? "border-destructive"
											: "border-border"
									}`}
								/>
							</View>

							<View className="gap-1.5">
								<Text className="font-semibold text-base text-foreground">
									Start Date
								</Text>
								<DateField
									value={dateInput}
									onChange={setDateInput}
									placeholder="Select date"
									invalid={showErrors && dateMs === null}
								/>
							</View>

							<View className="gap-1.5">
								<Text className="font-semibold text-base text-foreground">
									Entry Log
								</Text>
								<TextInput
									value={body}
									onChangeText={setBody}
									placeholder="Type here..."
									placeholderTextColor={placeholderColor}
									multiline
									numberOfLines={8}
									textAlignVertical="top"
									className={`min-h-40 rounded-2xl border bg-background px-4 py-3 text-base text-foreground ${
										showErrors && !body.trim()
											? "border-destructive"
											: "border-border"
									}`}
								/>
							</View>

							{/* Take Photo / Choose from Library */}
							<View className="gap-3 rounded-2xl border border-border/60 bg-secondary/20 p-3">
								{image ? (
									<View className="overflow-hidden rounded-xl">
										<Image
											source={{ uri: image.uri }}
											className="h-44 w-full"
											resizeMode="cover"
										/>
										<Pressable
											onPress={() => setImage(null)}
											accessibilityRole="button"
											accessibilityLabel="Remove photo"
											className="absolute top-2 right-2 size-9 items-center justify-center rounded-full bg-black/55 active:opacity-80"
										>
											<Ionicons
												name="close"
												size={20}
												color={accentForeground}
											/>
										</Pressable>
									</View>
								) : (
									<>
										<Pressable
											onPress={() => void handleTakePhoto()}
											accessibilityRole="button"
											accessibilityLabel="Take a photo"
											className="items-center gap-1.5 rounded-xl bg-background py-5 active:opacity-90"
										>
											<Ionicons
												name="camera-outline"
												size={26}
												color={foreground}
											/>
											<Text className="font-semibold text-base text-foreground">
												Take Photo
											</Text>
										</Pressable>

										<Pressable
											onPress={() => void handlePickFromLibrary()}
											accessibilityRole="button"
											accessibilityLabel="Choose from library"
											className="items-center gap-1.5 rounded-xl bg-background py-5 active:opacity-90"
										>
											<Ionicons
												name="images-outline"
												size={26}
												color={foreground}
											/>
											<Text className="font-semibold text-base text-foreground">
												Choose from Library
											</Text>
										</Pressable>
									</>
								)}
							</View>
						</>
					) : (
						<View className="items-center gap-3">
							<AudioRecorderField
								value={audio}
								onChange={setAudio}
								disabled={submitting}
							/>
							{audio ? (
								<Text className="text-muted-foreground text-sm">
									Tap Create above to save this entry.
								</Text>
							) : (
								<Text className="text-center text-sm" style={{ color: accent }}>
									Tap the microphone to start. Tap again to stop.
								</Text>
							)}
						</View>
					)}

					{showErrors &&
					mode === "writing" &&
					(!title.trim() || dateMs === null || !body.trim()) ? (
						<Text className="text-center text-destructive text-sm">
							Please fill in the title, start date, and entry log.
						</Text>
					) : null}
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
