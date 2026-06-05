import { Ionicons } from "@expo/vector-icons";
import {
	RecordingPresets,
	requestRecordingPermissionsAsync,
	setAudioModeAsync,
	useAudioPlayer,
	useAudioPlayerStatus,
	useAudioRecorder,
	useAudioRecorderState,
} from "expo-audio";
import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";

const ALERT_COLOR = "#dca114";
const ALERT_LIGHT = "#fff4db";

function formatDuration(ms: number): string {
	if (!Number.isFinite(ms) || ms < 0) return "0:00";
	const totalSeconds = Math.floor(ms / 1000);
	const mins = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${mins}:${String(secs).padStart(2, "0")}`;
}

type AudioRecorderFieldProps = {
	value: {
		uri: string;
		mimeType: string;
		durationMs: number;
	} | null;
	onChange: (next: AudioRecorderFieldProps["value"]) => void;
	disabled?: boolean;
};

/**
 * Big circular record button with a yellow ring (matches the screenshot).
 * After recording, exposes a play/stop control and a Re-record affordance.
 *
 * Audio is held locally as `{ uri, mimeType, durationMs }` and uploaded by
 * the parent screen at submit time via `uploadBinaryToConvex`.
 */
export function AudioRecorderField({
	value,
	onChange,
	disabled = false,
}: AudioRecorderFieldProps) {
	const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
	const recorderState = useAudioRecorderState(recorder);

	const player = useAudioPlayer(value ? { uri: value.uri } : null);
	const playerStatus = useAudioPlayerStatus(player);

	const [preparing, setPreparing] = useState(false);

	// Configure audio mode once.
	useEffect(() => {
		void setAudioModeAsync({
			allowsRecording: true,
			playsInSilentMode: true,
		}).catch(() => {});
	}, []);

	const isRecording = recorderState.isRecording;
	const isPlaying = playerStatus.playing;

	const handleStartRecording = async () => {
		if (disabled || preparing) return;
		setPreparing(true);
		try {
			const permission = await requestRecordingPermissionsAsync();
			if (!permission.granted) {
				Alert.alert(
					"Microphone access needed",
					"Allow microphone access in Settings to record audio entries.",
					[
						{ text: "Cancel", style: "cancel" },
						{
							text: "Open Settings",
							onPress: () => void Linking.openSettings(),
						},
					],
				);
				return;
			}
			await recorder.prepareToRecordAsync();
			recorder.record();
		} catch (err) {
			Alert.alert(
				"Could not start recording",
				err instanceof Error ? err.message : "Please try again.",
			);
		} finally {
			setPreparing(false);
		}
	};

	const handleStopRecording = async () => {
		try {
			await recorder.stop();
			const uri = recorder.uri;
			const durationMs = recorderState.durationMillis ?? 0;
			if (uri) {
				onChange({ uri, mimeType: "audio/m4a", durationMs });
			}
		} catch (err) {
			Alert.alert(
				"Could not save recording",
				err instanceof Error ? err.message : "Please try again.",
			);
		}
	};

	const handleTogglePlay = () => {
		if (!value) return;
		if (isPlaying) {
			player.pause();
		} else {
			if (playerStatus.didJustFinish || playerStatus.currentTime === 0) {
				player.seekTo(0);
			}
			player.play();
		}
	};

	const handleReRecord = () => {
		if (isPlaying) player.pause();
		onChange(null);
	};

	// Idle / Recording state — show the big circle button.
	if (!value) {
		const showStop = isRecording;
		return (
			<View className="items-center gap-3 py-4">
				<Pressable
					onPress={() =>
						showStop ? void handleStopRecording() : void handleStartRecording()
					}
					disabled={disabled || preparing}
					accessibilityRole="button"
					accessibilityLabel={showStop ? "Stop recording" : "Start recording"}
					className="size-44 items-center justify-center rounded-full active:opacity-90"
					style={{
						backgroundColor: "#e0e0e0",
						borderWidth: 5,
						borderColor: ALERT_COLOR,
						shadowColor: "#000",
						shadowOpacity: 0.12,
						shadowRadius: 10,
						shadowOffset: { width: 0, height: 4 },
						elevation: 4,
					}}
				>
					<Ionicons
						name={showStop ? "stop" : "mic"}
						size={64}
						color="#333333"
					/>
				</Pressable>

				<Text className="font-semibold text-xl" style={{ color: ALERT_COLOR }}>
					{showStop
						? formatDuration(recorderState.durationMillis ?? 0)
						: "Record"}
				</Text>
				{showStop ? (
					<Text className="text-muted-foreground text-sm">Tap to stop</Text>
				) : null}
			</View>
		);
	}

	// Recorded state — show playback row.
	return (
		<View className="gap-3 py-4">
			<View
				className="flex-row items-center gap-3 rounded-2xl px-4 py-4"
				style={{ backgroundColor: ALERT_LIGHT }}
			>
				<Pressable
					onPress={handleTogglePlay}
					disabled={disabled}
					accessibilityRole="button"
					accessibilityLabel={isPlaying ? "Pause" : "Play"}
					className="size-12 items-center justify-center rounded-full active:opacity-85"
					style={{ backgroundColor: ALERT_COLOR }}
				>
					<Ionicons
						name={isPlaying ? "pause" : "play"}
						size={22}
						color="#ffffff"
					/>
				</Pressable>

				<View className="flex-1">
					<Text className="font-semibold text-base text-foreground">
						Audio recording
					</Text>
					<Text className="text-muted-foreground text-sm">
						{formatDuration(value.durationMs)}
					</Text>
				</View>

				<Pressable
					onPress={handleReRecord}
					disabled={disabled}
					accessibilityRole="button"
					accessibilityLabel="Re-record"
					className="rounded-full px-3 py-2 active:opacity-70"
				>
					<Text
						className="font-semibold text-sm"
						style={{ color: ALERT_COLOR }}
					>
						Re-record
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
