import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pressable, Text, View } from "react-native";

const ALERT_COLOR = "#dca114";
const ALERT_LIGHT = "#fff4db";

function formatClock(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const total = Math.floor(seconds);
	const mins = Math.floor(total / 60);
	const secs = total % 60;
	return `${mins}:${String(secs).padStart(2, "0")}`;
}

type EntryAudioPlayerProps = {
	uri: string;
};

/** Playback row for a recording entry: play/pause, progress bar, timecodes. */
export function EntryAudioPlayer({ uri }: EntryAudioPlayerProps) {
	const player = useAudioPlayer({ uri });
	const status = useAudioPlayerStatus(player);

	const isPlaying = status.playing;
	const duration = status.duration || 0;
	const current = Math.min(
		status.currentTime || 0,
		duration || Number.POSITIVE_INFINITY,
	);
	const progress = duration > 0 ? Math.min(current / duration, 1) : 0;

	const handleToggle = () => {
		if (isPlaying) {
			player.pause();
			return;
		}
		if (status.didJustFinish || current >= duration) {
			player.seekTo(0);
		}
		player.play();
	};

	return (
		<View
			className="gap-3 rounded-2xl px-4 py-4"
			style={{ backgroundColor: ALERT_LIGHT }}
		>
			<View className="flex-row items-center gap-3">
				<Pressable
					onPress={handleToggle}
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

				<View className="flex-1 gap-1.5">
					<View className="h-1.5 overflow-hidden rounded-full bg-black/10">
						<View
							className="h-full rounded-full"
							style={{
								backgroundColor: ALERT_COLOR,
								width: `${Math.round(progress * 100)}%`,
							}}
						/>
					</View>
					<View className="flex-row justify-between">
						<Text className="text-muted-foreground text-xs">
							{formatClock(current)}
						</Text>
						<Text className="text-muted-foreground text-xs">
							{formatClock(duration)}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
