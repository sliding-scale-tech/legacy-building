import { useToast } from "heroui-native";
import { useMemo } from "react";

import { messageFromError } from "./error-utils";

/** Native mutation feedback — HeroUI toast (Sonner is web-only). */
export function useMutationToast() {
	const { toast } = useToast();

	return useMemo(
		() => ({
			success(message: string) {
				toast.show({ variant: "success", label: message });
			},
			error(
				err: unknown,
				fallback = "Something went wrong. Please try again.",
			) {
				toast.show({
					variant: "danger",
					label: messageFromError(err, fallback),
				});
			},
		}),
		[toast],
	);
}
