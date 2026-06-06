import { ConvexError } from "convex/values";

export function messageFromError(err: unknown, fallback: string): string {
	if (err instanceof ConvexError) {
		const data = err.data as { message?: string } | string | undefined;
		if (typeof data === "string") return data;
		if (data?.message) return data.message;
	}
	if (err instanceof Error) return err.message;
	return fallback;
}
