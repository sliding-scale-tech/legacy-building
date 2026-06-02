import { useUser } from "@clerk/expo";
import { api } from "@mobile-starter/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

export function useNativeDeviceInfoSync() {
	const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
	const setDeviceInfo = useMutation(api.user.mutations.setDeviceInfo);
	const lastSyncedKeyRef = useRef<string | null>(null);

	useEffect(() => {
		if (!clerkLoaded || !clerkUser) return;

		const key = `${clerkUser.id}|${Platform.OS}`;
		if (lastSyncedKeyRef.current === key) return;
		lastSyncedKeyRef.current = key;

		setDeviceInfo({
			deviceType: Platform.OS,
			isMobile: Platform.OS === "ios" || Platform.OS === "android",
		}).catch((err) => {
			lastSyncedKeyRef.current = null;
			console.warn("[native-device-info-sync] failed:", err);
		});
	}, [clerkLoaded, clerkUser, setDeviceInfo]);
}
