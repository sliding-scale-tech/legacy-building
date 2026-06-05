import { Ionicons } from "@expo/vector-icons";
import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import { useThemeColor } from "heroui-native/hooks";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JournalEntryRow } from "@/components/library/journal-entry-row";
import { formatDateLong } from "@/lib/journal/formatDate";

export default function JournalDetailScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ journalId?: string }>();
	const journalId = params.journalId as Id<"journals"> | undefined;

	const accent = useThemeColor("accent");
	const accentForeground = useThemeColor("accent-foreground");

	const journal = useQuery(
		api.journal.queries.getById,
		journalId ? { id: journalId } : "skip",
	);
	const entries = useQuery(
		api.journal.entries.queries.listByJournal,
		journalId ? { journalId } : "skip",
	);

	const isLoading = journal === undefined || entries === undefined;

	const goToCreateEntry = () => {
		if (!journalId) return;
		router.push({
			pathname: "/journal/[journalId]/new-entry",
			params: { journalId },
		});
	};

	return (
		<View className="flex-1 bg-secondary/30">
			{/* Teal header */}
			<View
				className="bg-primary px-4 pb-4"
				style={{ paddingTop: insets.top + 8 }}
			>
				<View className="h-10 flex-row items-center justify-between">
					<Pressable
						onPress={() => router.back()}
						accessibilityRole="button"
						accessibilityLabel="Back"
						className="flex-row items-center gap-1 active:opacity-70"
						hitSlop={8}
					>
						<Ionicons name="chevron-back" size={22} color={accentForeground} />
						<Text className="font-medium text-base text-primary-foreground">
							Back
						</Text>
					</Pressable>

					<Pressable
						accessibilityRole="button"
						accessibilityLabel="More options"
						className="size-9 items-center justify-center rounded-full active:opacity-70"
						hitSlop={8}
					>
						<Ionicons
							name="ellipsis-horizontal"
							size={22}
							color={accentForeground}
						/>
					</Pressable>
				</View>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerClassName="px-4 pt-6 pb-24 gap-4"
				showsVerticalScrollIndicator={false}
			>
				{isLoading ? (
					<View className="items-center justify-center py-12">
						<Spinner size="lg" />
					</View>
				) : journal === null ? (
					<View className="items-center py-12">
						<Text className="font-semibold text-foreground text-lg">
							Journal not found
						</Text>
						<Text className="mt-1 text-center text-muted-foreground text-sm">
							It may have been deleted.
						</Text>
					</View>
				) : (
					<>
						<View className="gap-2 pb-2">
							<Text className="font-semibold text-3xl text-foreground leading-tight">
								{journal.title}
							</Text>
							<View className="flex-row items-center gap-2">
								<Ionicons name="calendar-outline" size={18} color={accent} />
								<Text className="text-base text-foreground">
									{formatDateLong(journal.dateMs)}
									{journal.endDateMs
										? ` – ${formatDateLong(journal.endDateMs)}`
										: ""}
								</Text>
							</View>
						</View>

						{entries && entries.length > 0 ? (
							<View className="gap-3">
								{entries.map((entry) => (
									<JournalEntryRow
										key={entry._id}
										title={entry.title}
										dateMs={entry.dateMs}
										mode={entry.mode}
										onPress={() =>
											router.push({
												pathname: "/journal/entry/[entryId]",
												params: { entryId: entry._id },
											})
										}
									/>
								))}
							</View>
						) : (
							<View className="items-center gap-2 rounded-2xl border border-border border-dashed bg-background px-6 py-10">
								<Ionicons name="book-outline" size={32} color={accent} />
								<Text className="font-semibold text-base text-foreground">
									No entries yet
								</Text>
								<Text className="text-center text-muted-foreground text-sm">
									Tap Create Journal Entry below to add your first.
								</Text>
							</View>
						)}
					</>
				)}
			</ScrollView>

			{/* Floating create-entry button */}
			<View
				className="absolute right-4 left-4 items-center"
				style={{ bottom: insets.bottom + 16 }}
				pointerEvents="box-none"
			>
				<Pressable
					onPress={goToCreateEntry}
					disabled={!journalId || journal === null}
					accessibilityRole="button"
					accessibilityLabel="Create journal entry"
					className="h-14 w-full max-w-sm flex-row items-center justify-center gap-2 rounded-full bg-primary active:opacity-90"
					style={{
						shadowColor: "#000",
						shadowOpacity: 0.15,
						shadowRadius: 10,
						shadowOffset: { width: 0, height: 4 },
						elevation: 4,
					}}
				>
					<Ionicons name="create-outline" size={20} color="#ffffff" />
					<Text className="font-semibold text-base text-primary-foreground">
						Create Journal Entry
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
