import { api } from "@legacy-building/backend/convex/_generated/api";
import type { Id } from "@legacy-building/backend/convex/_generated/dataModel";
import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { useQuery } from "convex/react";
import { Pencil, Share, Trash2, X } from "lucide-react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { DeleteJournalDialog } from "@/components/journal/library/DeleteJournalDialog";
import { EditJournalSidebarForm } from "@/components/journal/library/EditJournalSidebarForm";
import { JournalCoverImage } from "@/components/journal/library/JournalCoverImage";
import { JournalEntryDetailView } from "@/components/journal/library/JournalEntryDetailView";
import { JournalEntryRow } from "@/components/journal/library/JournalEntryRow";
import { JournalExportFooter } from "@/components/journal/library/JournalExportFooter";
import { Button } from "@/components/journal/ui/button";
import { Checkbox } from "@/components/journal/ui/checkbox";
import { exportJournalEntriesToPdf } from "@/lib/journal/exportJournalPdf";
import { formatDate } from "@/lib/journal/formatDate";
import type { EnrichedJournalEntry } from "@/lib/journal/journalEntryTypes";
import { toastMutationError, toastMutationSuccess } from "@/lib/journal/toast";

type JournalDetailSheetProps = {
	journalId: Id<"journals"> | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleted?: () => void;
};

function SidebarIconButton({
	children,
	onClick,
	className,
	ariaLabel,
}: {
	children: ReactNode;
	onClick?: () => void;
	className?: string;
	ariaLabel: string;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={onClick}
			aria-label={ariaLabel}
			className={cn(
				"size-[30px] shrink-0 rounded p-[5px] hover:bg-transparent hover:opacity-80",
				className,
			)}
		>
			{children}
		</Button>
	);
}

export function JournalDetailSheet({
	journalId,
	open,
	onOpenChange,
	onDeleted,
}: JournalDetailSheetProps) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [journalEditing, setJournalEditing] = useState(false);
	const [selectedEntryId, setSelectedEntryId] =
		useState<Id<"journalEntries"> | null>(null);
	const [exportMode, setExportMode] = useState(false);
	const [selectedEntryIds, setSelectedEntryIds] = useState<
		Set<Id<"journalEntries">>
	>(() => new Set());
	const [exporting, setExporting] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	const journal = useQuery(
		api.journal.queries.getById,
		open && journalId ? { id: journalId } : "skip",
	);
	const entries = useQuery(
		api.journal.entries.queries.listByJournal,
		open && journalId ? { journalId } : "skip",
	);

	const enrichedEntries = useMemo(
		() => (entries ?? []) as EnrichedJournalEntry[],
		[entries],
	);

	/** Only writing entries can be exported to PDF (no audio) */
	const exportableEntries = useMemo(
		() => enrichedEntries.filter((entry) => entry.mode === "writing"),
		[enrichedEntries],
	);

	const allExportableSelected =
		exportableEntries.length > 0 &&
		exportableEntries.every((entry) => selectedEntryIds.has(entry._id));

	const entriesToShow = exportMode ? exportableEntries : enrichedEntries;

	const handleClose = useCallback(() => {
		onOpenChange(false);
	}, [onOpenChange]);

	const exitExportMode = useCallback(() => {
		setExportMode(false);
		setExportError(null);
		setSelectedEntryIds(new Set());
	}, []);

	const startExportMode = useCallback(() => {
		setExportMode(true);
		setExportError(null);
		setSelectedEntryIds(new Set(exportableEntries.map((entry) => entry._id)));
	}, [exportableEntries]);

	const toggleJournalMaster = useCallback(() => {
		if (allExportableSelected) {
			setSelectedEntryIds(new Set());
		} else {
			setSelectedEntryIds(new Set(exportableEntries.map((entry) => entry._id)));
		}
	}, [allExportableSelected, exportableEntries]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open) {
			setSelectedEntryId(null);
			setJournalEditing(false);
			exitExportMode();
		}
	}, [open, exitExportMode]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset sheet when selected journal changes
	useEffect(() => {
		setSelectedEntryId(null);
		setJournalEditing(false);
		exitExportMode();
	}, [journalId, exitExportMode]);

	useEffect(() => {
		if (!exportMode) return;
		const exportableIds = new Set(exportableEntries.map((e) => e._id));
		setSelectedEntryIds((prev) => {
			const next = new Set<Id<"journalEntries">>();
			for (const id of prev) {
				if (exportableIds.has(id)) next.add(id);
			}
			return next;
		});
	}, [exportMode, exportableEntries]);

	const toggleEntrySelection = useCallback((entryId: Id<"journalEntries">) => {
		setSelectedEntryIds((prev) => {
			const next = new Set(prev);
			if (next.has(entryId)) {
				next.delete(entryId);
			} else {
				next.add(entryId);
			}
			return next;
		});
	}, []);

	const canExport = allExportableSelected || selectedEntryIds.size > 0;

	const handleExportPdf = useCallback(async () => {
		if (!journal || !canExport) return;

		const selectedEntries = exportableEntries.filter((entry) =>
			selectedEntryIds.has(entry._id),
		);

		setExporting(true);
		setExportError(null);
		try {
			await exportJournalEntriesToPdf({
				journal: {
					title: journal.title,
					dateMs: journal.dateMs,
					type: journal.type,
					dedication: journal.dedication,
					coverImageUrl: journal.coverImageUrl,
				},
				includeJournal: allExportableSelected,
				entries: selectedEntries,
			});
			toastMutationSuccess("PDF downloaded.");
			exitExportMode();
		} catch (err) {
			const message = "Could not export PDF. Please try again.";
			setExportError(message);
			toastMutationError(err, message);
		} finally {
			setExporting(false);
		}
	}, [
		journal,
		canExport,
		exportableEntries,
		selectedEntryIds,
		allExportableSelected,
		exitExportMode,
	]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (journalEditing) {
					setJournalEditing(false);
				} else if (exportMode) {
					exitExportMode();
				} else if (selectedEntryId) {
					setSelectedEntryId(null);
				} else {
					handleClose();
				}
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [
		open,
		handleClose,
		selectedEntryId,
		exportMode,
		exitExportMode,
		journalEditing,
	]);

	if (!mounted) return null;

	const isLoading = open && journal === undefined;
	const loadedJournal = journal ?? null;

	return (
		<>
			{createPortal(
				<aside
					role="dialog"
					aria-modal="true"
					aria-label={
						loadedJournal
							? `Journal: ${loadedJournal.title}`
							: "Journal details"
					}
					className={cn(
						"fixed inset-y-0 right-0 z-[1506] flex flex-col",
						"w-full min-w-[320px] max-w-[400px]",
						"transition-transform duration-200 ease-in-out",
						open ? "translate-x-0" : "pointer-events-none translate-x-full",
					)}
					style={{ backgroundColor: brand.librarySidebarBg }}
				>
					{open ? (
						journalEditing && loadedJournal ? (
							<EditJournalSidebarForm
								journal={loadedJournal}
								onCancel={() => setJournalEditing(false)}
							/>
						) : selectedEntryId && !exportMode ? (
							<JournalEntryDetailView
								entryId={selectedEntryId}
								onBack={() => setSelectedEntryId(null)}
							/>
						) : (
							<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
								<div className="relative min-h-[200px] shrink-0 self-stretch">
									<div className="relative flex min-h-[200px] w-full items-center justify-center bg-white">
										{isLoading ? (
											<div
												className="size-full animate-pulse bg-[#f2f2f2]"
												style={{ minHeight: 200 }}
											/>
										) : loadedJournal ? (
											<JournalCoverImage
												coverImageId={loadedJournal.coverImageId}
												coverImageUrl={loadedJournal.coverImageUrl}
											/>
										) : null}
									</div>
									<SidebarIconButton
										ariaLabel="Close journal"
										onClick={handleClose}
										className="absolute top-2.5 left-2.5 bg-white"
									>
										<X
											className="size-5"
											style={{ color: brand.primary }}
											strokeWidth={2}
										/>
									</SidebarIconButton>
								</div>

								<div className="flex min-h-0 flex-1 flex-col py-5">
									<div className="flex shrink-0 flex-col gap-1.5 px-3">
										<div className="flex items-start justify-between gap-2">
											<div className="flex min-w-0 flex-1 items-center gap-1.5">
												{exportMode ? (
													<Checkbox
														checked={allExportableSelected}
														onCheckedChange={() => toggleJournalMaster()}
														aria-label="Select all entries for export"
														className="size-5 shrink-0"
													/>
												) : null}
												<h2 className="min-w-0 truncate font-semibold text-[#1a1a1a] text-base leading-[1.4]">
													{isLoading
														? "…"
														: loadedJournal
															? loadedJournal.title
															: "Journal not found"}
												</h2>
											</div>
											{loadedJournal ? (
												<div className="flex shrink-0 flex-row items-center">
													{exportMode ? (
														<>
															<SidebarIconButton
																ariaLabel="Cancel export"
																onClick={exitExportMode}
															>
																<X
																	className="size-5"
																	style={{ color: brand.sidebarDateMuted }}
																	strokeWidth={2}
																/>
															</SidebarIconButton>
															<SidebarIconButton
																ariaLabel="Delete journal"
																onClick={() => setDeleteOpen(true)}
															>
																<Trash2
																	className="size-5"
																	style={{ color: brand.destructive }}
																	strokeWidth={2}
																/>
															</SidebarIconButton>
														</>
													) : (
														<>
															<SidebarIconButton
																ariaLabel="Export journal to PDF"
																onClick={startExportMode}
															>
																<Share
																	className="size-5"
																	style={{ color: brand.primary }}
																	strokeWidth={2}
																/>
															</SidebarIconButton>
															<SidebarIconButton
																ariaLabel="Edit journal"
																onClick={() => setJournalEditing(true)}
															>
																<Pencil
																	className="size-5"
																	style={{ color: brand.primary }}
																	strokeWidth={2}
																/>
															</SidebarIconButton>
															<SidebarIconButton
																ariaLabel="Delete journal"
																onClick={() => setDeleteOpen(true)}
															>
																<Trash2
																	className="size-5"
																	style={{ color: brand.destructive }}
																	strokeWidth={2}
																/>
															</SidebarIconButton>
														</>
													)}
												</div>
											) : null}
										</div>
										{loadedJournal ? (
											<p
												className={cn(
													"font-normal text-sm leading-none",
													exportMode && "pl-6",
												)}
												style={{ color: brand.sidebarDateMuted }}
											>
												{formatDate(loadedJournal.dateMs)}
											</p>
										) : null}
									</div>

									<div
										className={cn(
											"mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain",
											exportMode ? "min-h-[200px]" : "min-h-[400px]",
										)}
									>
										{entries === undefined ? (
											<div className="mx-3 h-24 animate-pulse rounded bg-[#ececec]" />
										) : entriesToShow.length === 0 ? (
											<div className="px-3 py-6 text-center text-[#525252] text-sm">
												{exportMode && enrichedEntries.length > 0
													? "Recording entries are not included in PDF export."
													: null}
											</div>
										) : (
											<div className="flex flex-col">
												{entriesToShow.map((entry) => (
													<JournalEntryRow
														key={entry._id}
														entry={entry}
														selectionMode={exportMode}
														selected={selectedEntryIds.has(entry._id)}
														onToggleSelect={() =>
															toggleEntrySelection(entry._id)
														}
														onOpen={() => setSelectedEntryId(entry._id)}
													/>
												))}
											</div>
										)}
									</div>

									{exportError ? (
										<p
											className="px-3 pb-2 text-[#b0200c] text-sm"
											role="alert"
										>
											{exportError}
										</p>
									) : null}
								</div>

								{exportMode ? (
									<JournalExportFooter
										exporting={exporting}
										disabled={!canExport}
										onExport={() => void handleExportPdf()}
										onOrderBook={() => {
											/* order book — next iteration */
										}}
									/>
								) : null}
							</div>
						)
					) : null}
				</aside>,
				document.body,
			)}

			<DeleteJournalDialog
				journalId={journalId}
				journalTitle={journal?.title}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				onDeleted={() => {
					onDeleted?.();
					handleClose();
				}}
			/>
		</>
	);
}
