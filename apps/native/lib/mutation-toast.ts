import { useToast } from "heroui-native";
import { useMemo } from "react";

/** Native mutation feedback — HeroUI toast (Sonner is web-only). */
export function useMutationToast() {
	const { toast } = useToast();

	return useMemo(
		() => ({
			success(message: string) {
				toast.show({ variant: "success", label: message });
			},
			error(message: string) {
				toast.show({ variant: "danger", label: message });
			},
		}),
		[toast],
	);
}
