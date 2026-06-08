import type { FieldError as RHFFieldError } from "react-hook-form";

type Props = {
	message?: string | null;
};

/** @deprecated Prefer FieldError with combinedFieldErrors in new form code. */
export function AuthFieldError({ message }: Props) {
	if (!message) return null;
	return (
		<p className="fade-in-50 slide-in-from-top-1 animate-in text-destructive text-sm duration-150">
			{message}
		</p>
	);
}

export function mergeFieldMessages(
	zodMessage?: string,
	clerkMessage?: string | null | undefined,
): string | undefined {
	return zodMessage ?? clerkMessage ?? undefined;
}

export function combinedFieldErrors(
	rhfError?: RHFFieldError,
	clerkMessage?: string | null | undefined,
): Array<{ message?: string } | undefined> {
	const items: Array<{ message?: string } | undefined> = [];
	if (rhfError) items.push(rhfError);
	if (clerkMessage) items.push({ message: clerkMessage });
	return items;
}

export function fieldHasError(
	invalid: boolean,
	clerkMessage?: string | null | undefined,
): boolean {
	return invalid || Boolean(clerkMessage);
}

type ClerkFieldError =
	| { message?: string; longMessage?: string }
	| null
	| undefined;

/** Prefer Clerk's longMessage (e.g. "username is not a valid parameter…") over short "is unknown". */
export function clerkFieldMessage(field: ClerkFieldError): string | undefined {
	if (!field) return undefined;
	return field.longMessage ?? field.message;
}

type ClerkFieldErrors = {
	identifier?: ClerkFieldError;
	password?: ClerkFieldError;
	emailAddress?: ClerkFieldError;
	code?: ClerkFieldError;
	username?: ClerkFieldError;
};

export function hasClerkFieldErrors(fields: ClerkFieldErrors): boolean {
	return Boolean(
		clerkFieldMessage(fields.identifier) ||
			clerkFieldMessage(fields.password) ||
			clerkFieldMessage(fields.emailAddress) ||
			clerkFieldMessage(fields.code) ||
			clerkFieldMessage(fields.username),
	);
}
