import { useUser } from "@clerk/react";
import PasswordChangeForm from "@legacy-building/ui/components/password-change-form";
import { cn } from "@legacy-building/ui/lib/utils";
import { SquarePen } from "lucide-react";
import { useState } from "react";

import {
	accountInputClass,
	accountLabelClass,
	accountPersonalInfoEditButtonClass,
} from "@/components/account/accountFormStyles";
import { Input } from "@/components/journal/ui/input";

export function AccountPasswordSection() {
	const { user, isLoaded } = useUser();
	const [editing, setEditing] = useState(false);
	const canUpdatePassword = isLoaded && Boolean(user?.passwordEnabled);

	if (!canUpdatePassword) {
		return null;
	}

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center gap-1.5">
				<span className={accountLabelClass}>Password</span>
				<button
					type="button"
					onClick={() => setEditing((value) => !value)}
					className={accountPersonalInfoEditButtonClass}
					aria-label={editing ? "Close password editor" : "Edit password"}
					aria-expanded={editing}
				>
					<SquarePen className="size-3.5" strokeWidth={2} aria-hidden />
				</button>
			</div>

			<Input
				type="password"
				readOnly
				disabled
				value="••••••••••"
				className={cn(accountInputClass, "tracking-widest")}
				aria-label="Password (hidden)"
			/>

			{editing ? (
				<PasswordChangeForm
					appearance="light"
					layout="account"
					onSuccess={() => setEditing(false)}
				/>
			) : null}
		</div>
	);
}
