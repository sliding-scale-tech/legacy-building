import { useUser } from "@clerk/react";
import { api } from "@legacy-building/backend/convex/_generated/api";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";
import { brand } from "@legacy-building/ui/lib/brand-journal";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AccountPasswordSection } from "@/components/account/account-password-section";
import {
	accountCardClass,
	accountDangerButtonClass,
	accountInputClass,
	accountLabelClass,
	accountPrimaryButtonClass,
} from "@/components/account/accountFormStyles";
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";
import { DashboardFooter } from "@/components/journal/dashboard/DashboardFooter";
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

export function DashboardAccountPage() {
	const { user, isLoaded: clerkLoaded } = useUser();
	const { convexUser, isLoading } = useCurrentUser();
	const updateProfile = useMutation(api.user.mutations.updateProfile);

	const [username, setUsername] = useState("");
	const [savingUsername, setSavingUsername] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const passwordEnabled = Boolean(user?.passwordEnabled);
	const isGoogle = Boolean(
		user?.externalAccounts?.some((account) =>
			isGoogleOAuthProvider(account.provider),
		),
	);

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

	if (!clerkLoaded || isLoading) {
		return (
			<div className="relative flex min-h-svh w-full flex-col bg-white">
				<div className="mt-20 flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-10">
					<div className="mx-auto w-full max-w-[560px] animate-pulse">
						<div className="h-[420px] rounded-[20px] bg-[#f0f7f7]" />
					</div>
				</div>
				<DashboardFooter />
			</div>
		);
	}

	return (
		<div className="relative flex min-h-svh w-full flex-col bg-white">
			<div className="mt-20 flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-10">
				<div className={accountCardClass}>
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-1">
							<label htmlFor="account-username" className={accountLabelClass}>
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
											<Loader2 className="size-4 animate-spin" aria-hidden />
											Updating…
										</>
									) : (
										"Update"
									)}
								</Button>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label htmlFor="account-email" className={accountLabelClass}>
								Email
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

						{passwordEnabled ? <AccountPasswordSection /> : null}

						<div className="pt-4">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setDeleteOpen(true)}
								className={accountDangerButtonClass}
								style={{
									borderColor: brand.destructive,
									color: brand.destructive,
								}}
							>
								Delete account
							</Button>
						</div>
					</div>
				</div>
			</div>

			<DashboardFooter />
			<DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
		</div>
	);
}
