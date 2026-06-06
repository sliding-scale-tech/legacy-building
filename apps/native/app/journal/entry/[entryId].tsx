import { Ionicons } from "@expo/vector-icons";
import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import { useThemeColor } from "heroui-native/hooks";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EntryAudioPlayer } from "@/components/library/entry-audio-player";
import { formatDateLong } from "@/lib/journal/formatDate";
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

export default function JournalEntryDetailScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ entryId?: string }>();
	const entryId = params.entryId as Id<"journalEntries"> | undefined;

	const accent = useThemeColor("accent");
	const accentForeground = useThemeColor("accent-foreground");
	const mutationToast = useMutationToast();

	const entry = useQuery(
		api.journal.entries.queries.getById,
		entryId ? { id: entryId } : "skip",
	);
	const removeEntry = useMutation(api.journal.entries.mutations.remove);

	const handleMenu = () => {
		if (!entry) return;
		Alert.alert(entry.title, undefined, [
			{
				text: "Delete entry",
				style: "destructive",
				onPress: () => confirmDelete(),
			},
			{ text: "Cancel", style: "cancel" },
		]);
	};

	const confirmDelete = () => {
		Alert.alert("Delete entry?", "This can't be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => void doDelete(),
			},
		]);
	};

	const doDelete = async () => {
		if (!entryId) return;
		try {
			await removeEntry({ id: entryId });
			mutationToast.success("Entry deleted.");
			router.back();
		} catch (err) {
			mutationToast.error(
				messageFromError(err, "Could not delete entry. Please try again."),
			);
		}
	};

	const isRecording = entry?.mode === "recording";

	return (
		<View className="flex-1 bg-background">
			{/* Teal header with circular back + menu buttons */}
			<View
				className="bg-primary px-3 pb-3"
				style={{ paddingTop: insets.top + 6 }}
			>
				<View className="h-12 flex-row items-center justify-between">
					<Pressable
						onPress={() => router.back()}
						accessibilityRole="button"
						accessibilityLabel="Back"
						className="size-11 items-center justify-center rounded-full bg-white/15 active:opacity-70"
						hitSlop={6}
					>
						<Ionicons name="chevron-back" size={24} color={accentForeground} />
					</Pressable>

					<Pressable
						onPress={handleMenu}
						disabled={!entry}
						accessibilityRole="button"
						accessibilityLabel="Entry options"
						accessibilityState={{ disabled: !entry }}
						className="size-11 items-center justify-center rounded-full bg-white/15 active:opacity-70 disabled:opacity-40"
						hitSlop={6}
					>
						<Ionicons name="menu" size={24} color={accentForeground} />
					</Pressable>
				</View>
			</View>

			{entry === undefined ? (
				<View className="flex-1 items-center justify-center">
					<Spinner size="lg" />
				</View>
			) : entry === null ? (
				<View className="flex-1 items-center justify-center gap-2 px-6">
					<Text className="font-semibold text-foreground text-lg">
						Entry not found
					</Text>
					<Text className="text-center text-muted-foreground text-sm">
						It may have been deleted.
					</Text>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					contentContainerClassName="px-5 pt-5 pb-12 gap-3"
					showsVerticalScrollIndicator={false}
				>
					<Text className="font-semibold text-3xl text-foreground leading-tight">
						{entry.title}
					</Text>

					<View className="flex-row items-center gap-2">
						<Ionicons name="calendar-outline" size={18} color={accent} />
						<Text className="text-base text-foreground">
							{formatDateLong(entry.dateMs)}
						</Text>
					</View>

					{entry.imageUrl ? (
						<View className="mt-2 overflow-hidden rounded-2xl">
							<Image
								source={{ uri: entry.imageUrl }}
								className="h-60 w-full"
								resizeMode="cover"
								accessibilityLabel="Entry photo"
							/>
						</View>
					) : null}

					{isRecording && entry.audioUrl ? (
						<View className="mt-2">
							<EntryAudioPlayer uri={entry.audioUrl} />
						</View>
					) : null}

					{entry.mode === "writing" ? (
						<View className="mt-2">
							{entry.body ? (
								<Text className="text-base text-foreground leading-relaxed">
									{entry.body}
								</Text>
							) : (
								<Text className="text-muted-foreground text-sm">
									No entry text.
								</Text>
							)}
						</View>
					) : null}
				</ScrollView>
			)}
		</View>
	);
}
