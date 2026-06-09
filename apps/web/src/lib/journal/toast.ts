import { ConvexError } from "convex/values";
import { toast } from "sonner";

export function messageFromUnknownError(
	err: unknown,
	fallback: string,
): string {
	if (
		err instanceof ConvexError &&
		typeof err.data === "object" &&
		err.data !== null &&
		"message" in err.data
	) {
		return String((err.data as { message: string }).message);
	}
	if (err instanceof Error && err.message.trim()) {
		return err.message;
	}
	return fallback;
}

export function toastMutationError(err: unknown, fallback: string) {
	toast.error(messageFromUnknownError(err, fallback));
}

export function toastMutationSuccess(message: string) {
	toast.success(message);
}

/** Bubble-style informational toast (white box, teal text). */
export function toastBubbleMessage(message: string) {
	toast(message);
}
