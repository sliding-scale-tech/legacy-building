import PasswordChangeForm from "@legacy-building/ui/components/password-change-form";
import { cn } from "@legacy-building/ui/lib/utils";
import { Pencil } from "lucide-react";
import { useState } from "react";

import {
	accountInputClass,
	accountLabelClass,
} from "@/components/account/accountFormStyles";
import { Input } from "@/components/journal/ui/input";

export function AccountPasswordSection() {
	const [editing, setEditing] = useState(false);

	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-2">
				<span className={accountLabelClass}>Password</span>
				<button
					type="button"
					onClick={() => setEditing((v) => !v)}
					className="inline-flex size-7 items-center justify-center rounded text-[#008080] hover:bg-[#008080]/10"
					aria-label={editing ? "Close password editor" : "Edit password"}
					aria-expanded={editing}
				>
					<Pencil className="size-4" strokeWidth={2} aria-hidden />
				</button>
			</div>

			{editing ? (
				<div className="pt-1">
					<PasswordChangeForm
						appearance="light"
						compact
						onSuccess={() => setEditing(false)}
					/>
				</div>
			) : (
				<Input
					type="password"
					readOnly
					disabled
					value="••••••••••"
					className={cn(accountInputClass, "tracking-widest")}
					aria-label="Password (hidden)"
				/>
			)}
		</div>
	);
}
