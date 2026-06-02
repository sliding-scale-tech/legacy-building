import { api } from "@legacy-building/backend/convex/_generated/api";
import {
	TERMS_CHECKBOX_LABEL,
	TERMS_DESCRIPTION,
	TERMS_PARAGRAPHS,
	TERMS_TITLE,
} from "@legacy-building/ui/lib/terms";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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
			<View className="flex-1 justify-end bg-black/50">
				<View className="max-h-[80%] gap-3 rounded-t-2xl bg-popover p-5">
					<Text className="font-bold text-foreground text-xl">
						{TERMS_TITLE}
					</Text>
					<Text className="text-muted-foreground text-sm">
						{TERMS_DESCRIPTION}
					</Text>
					<ScrollView className="max-h-[320px]">
						<View className="gap-3">
							{TERMS_PARAGRAPHS.map((paragraph) => (
								<Text
									key={paragraph.slice(0, 24)}
									className="text-muted-foreground text-sm leading-5"
								>
									{paragraph}
								</Text>
							))}
						</View>
					</ScrollView>
					<Pressable
						className={`flex-row items-start gap-2.5 rounded-lg border p-3 ${agreed ? "border-primary bg-primary/10" : "border-border"}`}
						onPress={() => setAgreed((v) => !v)}
					>
						<View
							className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${agreed ? "border-primary bg-primary" : "border-border"}`}
						>
							{agreed ? (
								<Text className="font-bold text-primary-foreground text-xs">
									✓
								</Text>
							) : null}
						</View>
						<Text className="flex-1 text-foreground text-sm">
							{TERMS_CHECKBOX_LABEL}
						</Text>
					</Pressable>
					<Pressable
						className="items-center rounded-full bg-primary py-3.5 active:opacity-70 disabled:opacity-50"
						disabled={!agreed || submitting}
						onPress={() => void handleAgree()}
					>
						<Text className="font-semibold text-primary-foreground">
							{submitting ? "Saving…" : "Continue"}
						</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}
