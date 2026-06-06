import { useUser } from "@clerk/react";
import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import {
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import { Link } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ROUTES } from "@/lib/routes";

type CheckoutPaymentFormProps = {
	intentType: "setup" | "payment";
	amountLabel: string;
	subscriptionId: string | null;
	usesFallbackSetup: boolean;
	onFinalizeTrialSetup: (args: {
		subscriptionId: string;
		setupIntentId: string;
	}) => Promise<null>;
};

export function CheckoutPaymentForm({
	intentType,
	amountLabel,
	subscriptionId,
	usesFallbackSetup,
	onFinalizeTrialSetup,
}: CheckoutPaymentFormProps) {
	const stripe = useStripe();
	const elements = useElements();
	const { user } = useUser();
	const [pending, setPending] = useState(false);
	const [fullName, setFullName] = useState(
		user?.fullName ?? user?.firstName ?? "",
	);
	const email = user?.primaryEmailAddress?.emailAddress ?? "";

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!stripe || !elements) return;

		setPending(true);
		const returnUrl = `${window.location.origin}${ROUTES.dashboardBillingSuccess}`;

		try {
			const confirmParams = {
				return_url: returnUrl,
				payment_method_data: {
					billing_details: {
						name: fullName.trim() || undefined,
						email: email.trim() || undefined,
					},
				},
			};

			const result =
				intentType === "setup"
					? await stripe.confirmSetup({
							elements,
							confirmParams,
							redirect: "if_required",
						})
					: await stripe.confirmPayment({
							elements,
							confirmParams,
							redirect: "if_required",
						});

			if (result.error) {
				toast.error(
					result.error.message ?? "Payment failed. Please try again.",
				);
				setPending(false);
				return;
			}

			if (intentType === "setup" && usesFallbackSetup && subscriptionId) {
				const setupIntent = (
					result as { setupIntent?: { id: string; status: string } }
				).setupIntent;
				if (setupIntent?.status === "succeeded" && setupIntent.id) {
					await onFinalizeTrialSetup({
						subscriptionId,
						setupIntentId: setupIntent.id,
					});
				}
			}

			if (
				(result as { paymentIntent?: { status: string } }).paymentIntent
					?.status === "succeeded" ||
				(result as { setupIntent?: { status: string } }).setupIntent?.status ===
					"succeeded"
			) {
				window.location.href = `${window.location.origin}${ROUTES.dashboardBillingSuccess}?next=billing`;
			}
		} catch {
			toast.error("Payment failed. Please try again.");
			setPending(false);
		}
	};

	const inputClass =
		"h-11 w-full rounded-xl border border-[#e6e6e6] bg-white px-3 text-[#1a1a1a] text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/30";
	const readOnlyInputClass =
		"h-11 w-full cursor-not-allowed rounded-xl border border-[#e6e6e6] bg-[#f5f5f5] px-3 text-[#525252] text-sm outline-none";

	return (
		<form
			onSubmit={(e) => void handleSubmit(e)}
			className="flex flex-col gap-6"
		>
			<h2 className="font-semibold text-[#1a1a1a] text-xl">
				Payment Information
			</h2>

			<div className="flex flex-col gap-4">
				<p className="font-medium text-[#525252] text-sm">
					Contact Information
				</p>
				<label className="flex flex-col gap-1.5">
					<span className="text-[#525252] text-xs">Full Name</span>
					<input
						type="text"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						placeholder="John Doe"
						className={inputClass}
						autoComplete="name"
					/>
				</label>
				<label className="flex flex-col gap-1.5">
					<span className="text-[#525252] text-xs">Email Address</span>
					<input
						type="email"
						value={email}
						readOnly
						disabled
						className={readOnlyInputClass}
						autoComplete="email"
						aria-label="Email address (read only)"
					/>
				</label>
			</div>

			<div className="flex flex-col gap-3">
				<p className="font-medium text-[#525252] text-sm">Payment Method</p>
				<div className="rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-4">
					<PaymentElement
						options={{
							layout: "tabs",
							fields: {
								billingDetails: {
									email: "never",
								},
							},
							defaultValues: {
								billingDetails: {
									name: fullName || undefined,
									email: email || undefined,
								},
							},
						}}
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={!stripe || !elements || pending}
				className={cn(
					"flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-sm text-white",
					"transition-colors hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60",
				)}
				style={{ backgroundColor: brand.primary }}
			>
				{pending ? (
					<>
						<Loader2 className="size-4 animate-spin" aria-hidden />
						Processing…
					</>
				) : (
					amountLabel
				)}
			</button>

			<div className="flex flex-col items-center gap-2 text-center">
				<p className="inline-flex items-center gap-1.5 text-[#8a8a8a] text-xs">
					<Lock className="size-3.5" aria-hidden />
					Secure payments powered by Stripe
				</p>
				<p className="text-[#8a8a8a] text-xs leading-relaxed">
					By clicking &quot;Complete Payment&quot;, you agree to our{" "}
					<Link
						to={ROUTES.terms}
						className="text-[#008080] underline-offset-2 hover:underline"
					>
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link
						to={ROUTES.privacy}
						className="text-[#008080] underline-offset-2 hover:underline"
					>
						Privacy Policy
					</Link>
					.
				</p>
			</div>
		</form>
	);
}
