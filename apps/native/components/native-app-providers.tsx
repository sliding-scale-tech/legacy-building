import { useNativeDeviceInfoSync } from "@/hooks/use-native-device-info-sync";

export function NativeAppProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	useNativeDeviceInfoSync();

	return children;
}
