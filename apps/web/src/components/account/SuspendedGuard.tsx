import { SignOutButton } from "@clerk/react";
import { Button } from "@legacy-building/ui/components/button";
import { useCurrentUser } from "@legacy-building/ui/hooks/use-current-user";

type SuspendedGuardProps = {
	children: React.ReactNode;
};

function effectiveAccountStatus(
	accountStatus: "active" | "suspended" | undefined,
): "active" | "suspended" {
	return accountStatus ?? "active";
}

/** Blocks suspended users from the dashboard. */
export function SuspendedGuard({ children }: SuspendedGuardProps) {
	const { convexUser } = useCurrentUser();

	const isSuspended =
		convexUser &&
		effectiveAccountStatus(convexUser.accountStatus) === "suspended";

	if (isSuspended) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center bg-[#ebf6f6] px-6 py-12">
				<div className="w-full max-w-md rounded-2xl border border-[#e6e6e6] bg-white p-8 text-center shadow-sm">
					<h1 className="font-heading font-semibold text-2xl text-[#1a1a1a] tracking-tight">
						Account suspended
					</h1>
					<p className="mt-3 text-[#525252] text-sm leading-relaxed">
						Your account has been suspended. Contact support if you believe this
						is a mistake.
					</p>
					<SignOutButton>
						<Button className="mt-6 h-11 w-full rounded-xl bg-[#008080] font-medium text-white hover:bg-[#006b6b]">
							Sign out
						</Button>
					</SignOutButton>
				</div>
			</div>
		);
	}

	return children;
}
