import { api } from "@legacy-building/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useNativeCurrentUser } from "@/hooks/use-native-current-user";

export function NativeTermsAgreement() {
	const { convexUser, isSignedIn, isLoading } = useNativeCurrentUser();
	const agreeToTerms = useMutation(api.user.mutations.agreeToTerms);
	const [agreed, setAgreed] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const needsAgreement =
		!isLoading &&
		isSignedIn &&
		convexUser !== null &&
		convexUser !== undefined &&
		!convexUser.agreedToTermsAt;

	if (!needsAgreement) return null;

	const handleAgree = async () => {
		if (!agreed || submitting) return;
		setSubmitting(true);
		try {
			await agreeToTerms({});
		} catch (err) {
			console.warn(
				err instanceof ConvexError
					? err.data
					: "Could not save terms agreement",
			);
			setSubmitting(false);
		}
	};

	return (
		<Modal visible animationType="slide" transparent>
			<View style={styles.backdrop}>
				<View style={styles.sheet}>
					<Text style={styles.title}>Terms and Conditions</Text>
					<ScrollView style={styles.scroll}>
						<Text style={styles.body}>
							By continuing you agree to the terms of service and privacy
							policy. Replace this copy before launch.
						</Text>
					</ScrollView>
					<Pressable
						style={[styles.checkboxRow, agreed && styles.checkboxRowActive]}
						onPress={() => setAgreed((v) => !v)}
					>
						<Text style={styles.checkboxText}>I agree to the terms</Text>
					</Pressable>
					<Pressable
						style={[
							styles.button,
							(!agreed || submitting) && styles.buttonDisabled,
						]}
						disabled={!agreed || submitting}
						onPress={() => void handleAgree()}
					>
						<Text style={styles.buttonText}>
							{submitting ? "Saving…" : "Continue"}
						</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		padding: 20,
		maxHeight: "80%",
		gap: 12,
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
	},
	scroll: {
		maxHeight: 200,
	},
	body: {
		fontSize: 14,
		color: "#555",
		lineHeight: 20,
	},
	checkboxRow: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
	},
	checkboxRowActive: {
		borderColor: "#0a7ea4",
		backgroundColor: "#f0f9fc",
	},
	checkboxText: {
		fontSize: 14,
	},
	button: {
		backgroundColor: "#0a7ea4",
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
	},
});
