import { useUser } from "@clerk/react";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { PageLoader } from "@legacy-building/ui/components/page-loader";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Info, Loader2, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import { AccountPasswordSection } from "@/components/account/account-password-section";
import {
	ACCOUNT_PAGE_BG,
	accountCardClass,
	accountDangerButtonClass,
	accountDangerZoneBodyClass,
	accountDangerZoneHeaderClass,
	accountInputClass,
	accountLabelClass,
	accountPageClass,
	accountPrimaryButtonClass,
	accountSecondaryButtonClass,
	accountSectionSubtitleClass,
	accountSectionTitleClass,
	accountWarningBoxClass,
} from "@/components/account/accountFormStyles";
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";
import { Button } from "@/components/journal/ui/button";
import { Input } from "@/components/journal/ui/input";
import {
	formatNameAsUsername,
	isGoogleOAuthProvider,
} from "@/lib/account/username";
import {
	messageFromUnknownError,
	toastMutationError,
	toastMutationSuccess,
} from "@/lib/journal/toast";
import { ROUTES } from "@/lib/routes";

function defaultUsername(
	convexName: string | undefined,
	clerkFullName: string | null | undefined,
	isGoogle: boolean,
): string {
	if (convexName?.trim()) return convexName.trim();
	if (isGoogle && clerkFullName?.trim()) {
		return formatNameAsUsername(clerkFullName);
	}
	return clerkFullName?.trim() ?? "";
}

function formatShortDate(ms: number) {
	return new Date(ms).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function formatBillingBannerDate(seconds: number) {
	return new Date(seconds * 1000).toLocaleDateString(undefined, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function planLabel(interval: "monthly" | "annual" | null, planName?: string) {
	if (planName) return `${planName} Plan`;
	if (interval === "annual") return "Annual Plan";
	if (interval === "monthly") return "Monthly Plan";
	return "Subscription";
}

export function DashboardAccountPage() {
	const { user, isLoaded: clerkLoaded } = useUser();
	const { convexUser, isLoading } = useCurrentUser();
	const subscription = useQuery(api.stripe.queries.getMySubscription);
	const updateProfile = useMutation(api.user.mutations.updateProfile);

	const [username, setUsername] = useState("");
	const [savingUsername, setSavingUsername] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [bannerDismissed, setBannerDismissed] = useState(false);

	const isGoogle = Boolean(
		user?.externalAccounts?.some((account) =>
			isGoogleOAuthProvider(account.provider),
		),
	);
	const showPasswordUpdate = !isGoogle;

	const email =
		user?.primaryEmailAddress?.emailAddress ?? convexUser?.email ?? "";

	useEffect(() => {
		if (!clerkLoaded || isLoading) return;
		setUsername(
			defaultUsername(convexUser?.name, user?.fullName ?? null, isGoogle),
		);
	}, [clerkLoaded, isLoading, convexUser?.name, user?.fullName, isGoogle]);

	const handleUsernameUpdate = async () => {
		const trimmed = username.trim();
		if (trimmed.length < 2) {
			toastMutationError(
				new Error("Username too short"),
				"Username must be at least 2 characters.",
			);
			return;
		}
		setSavingUsername(true);
		try {
			await updateProfile({ name: trimmed });
			toastMutationSuccess("Username updated.");
		} catch (err) {
			toastMutationError(
				err,
				messageFromUnknownError(
					err,
					"Could not update username. Please try again.",
				),
			);
		} finally {
			setSavingUsername(false);
		}
	};

	if (!clerkLoaded || isLoading || subscription === undefined) {
		return <PageLoader />;
	}

	const hasLivePlan =
		subscription &&
		(subscription.status === "active" ||
			subscription.status === "trialing" ||
			subscription.status === "past_due");

	const showBillingBanner =
		hasLivePlan && subscription.currentPeriodEnd && !bannerDismissed;

	const activeSinceMs = convexUser?._creationTime;
	const currentPlanName = planLabel(
		subscription?.interval ?? null,
		subscription?.plan?.name,
	);

	return (
		<div
			className="relative flex min-h-svh w-full flex-col"
			style={{ backgroundColor: ACCOUNT_PAGE_BG }}
		>
			<div className="mt-20 flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-10 md:py-10">
				<div className={accountPageClass}>
					<header className="flex flex-col gap-2">
						<h1 className="font-semibold text-3xl text-[#1a1a1a]">
							Account Settings
						</h1>
						<p className={accountSectionSubtitleClass}>
							Manage your identity and security preferences across the Legacy
							Building platform.
						</p>
					</header>

					{showBillingBanner ? (
						<div className="flex items-start gap-3 rounded-xl border border-[#b8e0e0] bg-[#ebf6f6] px-4 py-3 sm:px-5 sm:py-4">
							<Info
								className="mt-0.5 size-5 shrink-0 text-[#008080]"
								aria-hidden
							/>
							<div className="min-w-0 flex-1 text-[#1a1a1a] text-sm leading-relaxed">
								<span className="font-medium">Next Billing date on </span>
								{formatBillingBannerDate(subscription.currentPeriodEnd)}. Ensure
								timely subscription renewal to keep enjoying {currentPlanName}.
								<Link
									to={ROUTES.dashboardBilling}
									className="ml-1 font-medium text-[#008080] hover:underline"
								>
									View Details
								</Link>
							</div>
							<button
								type="button"
								onClick={() => setBannerDismissed(true)}
								className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[#525252] hover:bg-white/70"
								aria-label="Dismiss billing reminder"
							>
								<X className="size-4" aria-hidden />
							</button>
						</div>
					) : null}

					<section className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<h2 className={accountSectionTitleClass}>Personal Information</h2>
							<p className={accountSectionSubtitleClass}>
								Update your profile details and contact information.
							</p>
						</div>

						<div className={accountCardClass}>
							<div className="grid gap-5 sm:grid-cols-2">
								<div className="flex flex-col gap-1.5 sm:col-span-2">
									<label
										htmlFor="account-username"
										className={accountLabelClass}
									>
										Username
									</label>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
										<Input
											id="account-username"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											className={accountInputClass}
											autoComplete="username"
										/>
										<Button
											type="button"
											disabled={savingUsername}
											onClick={() => void handleUsernameUpdate()}
											className={accountPrimaryButtonClass}
										>
											{savingUsername ? (
												<>
													<Loader2
														className="size-4 animate-spin"
														aria-hidden
													/>
													Updating…
												</>
											) : (
												"Update Username"
											)}
										</Button>
									</div>
								</div>

								<div className="flex flex-col gap-1.5">
									<label htmlFor="account-email" className={accountLabelClass}>
										Email Address
									</label>
									<Input
										id="account-email"
										type="email"
										value={email}
										readOnly
										disabled
										className={accountInputClass}
										aria-label="Email address (read only)"
									/>
								</div>

								{showPasswordUpdate ? (
									<div className="flex flex-col gap-1.5">
										<AccountPasswordSection />
									</div>
								) : null}
							</div>
						</div>
					</section>

					<section className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<h2 className={accountSectionTitleClass}>Plan Status</h2>
							<p className={accountSectionSubtitleClass}>
								View your current subscription and billing details.
							</p>
						</div>

						<div className={accountCardClass}>
							{hasLivePlan ? (
								<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex flex-col gap-3">
										<div className="flex items-center gap-2">
											<span
												className="size-2.5 rounded-full bg-[#22c55e]"
												aria-hidden
											/>
											<span className="font-semibold text-[#1a1a1a] text-lg">
												{currentPlanName}
											</span>
										</div>
										{activeSinceMs ? (
											<p className="text-[#525252] text-sm">
												<span className="font-medium text-[#1a1a1a]">
													Active Since:{" "}
												</span>
												{formatShortDate(activeSinceMs)}
											</p>
										) : null}
									</div>
									<Link
										to={ROUTES.dashboardBilling}
										className={accountSecondaryButtonClass}
									>
										Manage Subscription
									</Link>
								</div>
							) : (
								<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-center gap-2">
										<User className="size-5 text-[#525252]" aria-hidden />
										<p className="text-[#525252] text-sm">
											You don&apos;t have an active subscription.
										</p>
									</div>
									<Link
										to={ROUTES.dashboardBilling}
										className={accountPrimaryButtonClass}
									>
										View Plans
									</Link>
								</div>
							)}
						</div>
					</section>

					<section className="flex flex-col gap-0 overflow-hidden rounded-2xl shadow-sm">
						<div className={accountDangerZoneHeaderClass}>
							<h2 className="font-semibold text-[#b91c1c] text-lg">
								Danger Zone
							</h2>
							<p className="text-[#7f1d1d] text-sm">
								Irreversible and destructive actions.
							</p>
						</div>
						<div className={accountDangerZoneBodyClass}>
							<div className="flex flex-col gap-4">
								<div>
									<h3 className="font-semibold text-[#1a1a1a] text-base">
										Delete Account
									</h3>
									<p className="mt-1 max-w-2xl text-[#525252] text-sm leading-relaxed">
										Once you delete your account, there is no going back. All
										your data, journals, and entries will be permanently
										deleted.
									</p>
								</div>
								<div className={accountWarningBoxClass}>
									This action cannot be undone. Make sure to export your data
									before deleting your account.
								</div>
								<div className="flex justify-end">
									<Button
										type="button"
										onClick={() => setDeleteOpen(true)}
										className={accountDangerButtonClass}
									>
										Delete My Account
									</Button>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>

			<DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
		</div>
	);
}
