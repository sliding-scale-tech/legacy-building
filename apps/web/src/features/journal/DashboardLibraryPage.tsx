import { api } from "@legacy-building/backend/convex/_generated/api";
import type {
	Doc,
	Id,
} from "@legacy-building/backend/convex/_generated/dataModel";
import { Button } from "@legacy-building/ui/components/button";
import { brand, dashboardLayout } from "@legacy-building/ui/lib/brand-journal";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

import { DashboardFooter } from "@/components/journal/dashboard/DashboardFooter";
import { AddJournalEntryPanel } from "@/components/journal/library/AddJournalEntryPanel";
import { CreateJournalDialog } from "@/components/journal/library/CreateJournalDialog";
import { JournalDetailSheet } from "@/components/journal/library/JournalDetailSheet";
import { LibraryEmptyState } from "@/components/journal/library/LibraryEmptyState";
import { LibraryJournalGrid } from "@/components/journal/library/LibraryJournalGrid";
import { LibraryStoryTabs } from "@/components/journal/library/LibraryStoryTabs";
import { DEFAULT_STORY_TAB, type StoryTab } from "@/lib/journal/journalTypes";
import { readLibraryLocationState } from "@/lib/journal/libraryNavigation";

export function DashboardLibraryPage() {
	const navigate = useNavigate();
	const locationState = useRouterState({
		select: (s) => s.location.state,
	});
	const [storyTab, setStoryTab] = useState<StoryTab>(DEFAULT_STORY_TAB);
	const [createOpen, setCreateOpen] = useState(false);
	const [selectedJournalId, setSelectedJournalId] =
		useState<Id<"journals"> | null>(null);
	const [entryPanelJournalId, setEntryPanelJournalId] =
		useState<Id<"journals"> | null>(null);
	const [entryPanelOpen, setEntryPanelOpen] = useState(false);

	const journals = useQuery(api.journal.queries.listByType, {
		type: storyTab,
	});

	useEffect(() => {
		const nav = readLibraryLocationState(locationState);
		if (!nav) return;

		if (nav.storyTab) {
			setStoryTab(nav.storyTab);
		}

		if (nav.journalId) {
			if (nav.openAddEntry) {
				setSelectedJournalId(null);
				setEntryPanelJournalId(nav.journalId);
				setEntryPanelOpen(true);
			} else {
				setSelectedJournalId(nav.journalId);
			}
		}

		void navigate({
			replace: true,
			state: {},
		});
	}, [locationState, navigate]);

	const resetOverlays = useCallback(() => {
		setSelectedJournalId(null);
		setEntryPanelOpen(false);
		setEntryPanelJournalId(null);
		setCreateOpen(false);
	}, []);

	const handleStoryTabChange = useCallback(
		(tab: StoryTab) => {
			if (tab === storyTab) return;
			resetOverlays();
			setStoryTab(tab);
		},
		[storyTab, resetOverlays],
	);

	useEffect(() => {
		if (!journals || !selectedJournalId) return;
		if (!journals.some((j: Doc<"journals">) => j._id === selectedJournalId)) {
			setSelectedJournalId(null);
		}
	}, [journals, selectedJournalId]);

	useEffect(() => {
		if (!journals || !entryPanelJournalId) return;
		if (!journals.some((j: Doc<"journals">) => j._id === entryPanelJournalId)) {
			setEntryPanelOpen(false);
			setEntryPanelJournalId(null);
		}
	}, [journals, entryPanelJournalId]);

	const openCreate = useCallback(() => setCreateOpen(true), []);

	const handleOpenJournal = useCallback((journal: Doc<"journals">) => {
		setSelectedJournalId(journal._id);
	}, []);

	const handleAddEntry = useCallback((journal: Doc<"journals">) => {
		setSelectedJournalId(null);
		setEntryPanelJournalId(journal._id);
		setEntryPanelOpen(true);
	}, []);

	const handleEntryPanelOpenChange = useCallback((next: boolean) => {
		setEntryPanelOpen(next);
		if (!next) {
			window.setTimeout(() => setEntryPanelJournalId(null), 300);
		}
	}, []);

	const isLoading = journals === undefined;
	const isEmpty = journals !== undefined && journals.length === 0;

	return (
		<>
			<main
				className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5"
				style={{
					marginTop: dashboardLayout.contentMarginTop,
					padding: `${dashboardLayout.contentPaddingY}px ${dashboardLayout.contentPaddingX}px`,
				}}
			>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<LibraryStoryTabs value={storyTab} onChange={handleStoryTabChange} />
					<Button
						type="button"
						onClick={openCreate}
						className="min-h-11 rounded-xl px-5 font-medium text-sm leading-[1.4] hover:opacity-95"
					>
						Add Journal
					</Button>
				</div>

				{isLoading ? (
					<div
						className="w-full animate-pulse rounded-[20px]"
						style={{
							backgroundColor: brand.libraryMint,
							minHeight: 600,
						}}
					/>
				) : isEmpty ? (
					<LibraryEmptyState onBeginLegacy={openCreate} />
				) : (
					<LibraryJournalGrid
						storyTab={storyTab}
						journals={journals}
						onOpenJournal={handleOpenJournal}
						onAddEntry={handleAddEntry}
					/>
				)}
			</main>

			<DashboardFooter />

			<CreateJournalDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				defaultStoryType={storyTab}
				onCreated={(type) => {
					setStoryTab(type);
					resetOverlays();
				}}
			/>

			<JournalDetailSheet
				key={storyTab}
				journalId={selectedJournalId}
				open={selectedJournalId !== null}
				onOpenChange={(next) => {
					if (!next) setSelectedJournalId(null);
				}}
				onDeleted={() => setSelectedJournalId(null)}
			/>

			<AddJournalEntryPanel
				key={storyTab}
				journalId={entryPanelJournalId}
				journals={journals ?? []}
				open={entryPanelOpen}
				onOpenChange={handleEntryPanelOpenChange}
			/>
		</>
	);
}
