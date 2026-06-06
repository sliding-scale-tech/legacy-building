import { cn } from "@legacy-building/ui/lib/utils";
import { Download, Loader2, X } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/components/journal/ui/dialog";

export type BillingInvoice = {
	stripeInvoiceId: string;
	created: number;
	amountDue: number;
	amountPaid: number;
	status: string;
	hostedInvoiceUrl: string | null;
};

function formatDate(seconds: number) {
	return new Date(seconds * 1000).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function formatMoney(amountInCents: number) {
	return `$${(amountInCents / 100).toFixed(2)}`;
}

function formatInvoiceId(invoice: BillingInvoice, sequence: number) {
	const year = new Date(invoice.created * 1000).getFullYear();
	return `Invoice #${year}-${String(sequence).padStart(3, "0")}`;
}

function statusLabel(status: string) {
	if (status === "paid") return "Paid";
	if (status === "open") return "Open";
	if (status === "draft") return "Draft";
	if (status === "void") return "Void";
	if (status === "uncollectible") return "Uncollectible";
	return status.replace(/_/g, " ");
}

type ViewInvoicesModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	invoices: BillingInvoice[];
	loading?: boolean;
};

export function ViewInvoicesModal({
	open,
	onOpenChange,
	invoices,
	loading = false,
}: ViewInvoicesModalProps) {
	const handleDownload = (invoice: BillingInvoice) => {
		if (invoice.hostedInvoiceUrl) {
			window.open(invoice.hostedInvoiceUrl, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				overlayClassName="bg-[#646464]/70 supports-backdrop-filter:backdrop-blur-[2px]"
				className="z-[2002] max-h-[min(90vh,720px)] w-full max-w-[720px] gap-0 overflow-hidden rounded-2xl border border-[#e6e6e6] bg-white p-0 shadow-xl sm:max-w-[720px]"
			>
				<div className="flex items-center justify-between border-[#e6e6e6] border-b px-6 py-5">
					<DialogTitle className="font-semibold text-[#1a1a1a] text-xl">
						View Invoices
					</DialogTitle>
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="inline-flex size-9 items-center justify-center rounded-lg text-[#525252] hover:bg-[#f5f5f5]"
						aria-label="Close"
					>
						<X className="size-5" aria-hidden />
					</button>
				</div>

				<div className="overflow-x-auto px-6 py-4">
					{loading ? (
						<div className="flex min-h-[200px] items-center justify-center">
							<Loader2
								className="size-6 animate-spin text-[#008080]"
								aria-hidden
							/>
						</div>
					) : invoices.length === 0 ? (
						<p className="py-10 text-center text-[#8a8a8a] text-sm">
							No invoices yet. Invoices appear here after your first charge.
						</p>
					) : (
						<table className="w-full min-w-[560px] border-collapse text-left">
							<thead>
								<tr className="border-[#e6e6e6] border-b">
									<th className="pb-3 font-semibold text-[#1a1a1a] text-sm">
										Invoice ID
									</th>
									<th className="pb-3 font-semibold text-[#1a1a1a] text-sm">
										Amount
									</th>
									<th className="pb-3 font-semibold text-[#1a1a1a] text-sm">
										Date Paid
									</th>
									<th className="pb-3 font-semibold text-[#1a1a1a] text-sm">
										Status
									</th>
									<th className="pb-3 text-right font-semibold text-[#1a1a1a] text-sm">
										<span className="sr-only">Download</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{invoices.map((invoice, index) => {
									const amount =
										invoice.status === "paid"
											? invoice.amountPaid
											: invoice.amountDue;
									const sequence = invoices.length - index;
									return (
										<tr
											key={invoice.stripeInvoiceId}
											className="border-[#e6e6e6] border-b last:border-b-0"
										>
											<td className="py-4 font-medium text-[#1a1a1a] text-sm">
												{formatInvoiceId(invoice, sequence)}
											</td>
											<td className="py-4 text-[#1a1a1a] text-sm">
												{formatMoney(amount)}
											</td>
											<td className="py-4 text-[#1a1a1a] text-sm">
												{formatDate(invoice.created)}
											</td>
											<td className="py-4">
												<span
													className={cn(
														"inline-flex rounded-full px-2.5 py-0.5 font-medium text-xs capitalize",
														invoice.status === "paid"
															? "bg-[#dcfce7] text-[#166534]"
															: "bg-[#f3f4f6] text-[#525252]",
													)}
												>
													{statusLabel(invoice.status)}
												</span>
											</td>
											<td className="py-4 text-right">
												<button
													type="button"
													onClick={() => handleDownload(invoice)}
													disabled={!invoice.hostedInvoiceUrl}
													className="inline-flex size-8 items-center justify-center rounded-lg text-[#525252] hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"
													aria-label={`Download ${formatInvoiceId(invoice, sequence)}`}
												>
													<Download className="size-4" aria-hidden />
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
