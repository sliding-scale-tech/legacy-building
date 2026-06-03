import { cn } from "@legacy-building/ui/lib/utils";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/journal/ui/button";

const BAR_COUNT = 32;

/** Stable pseudo-random bar heights for waveform silhouette */
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
	const n = Math.sin(i * 0.55) * 0.5 + Math.cos(i * 0.31) * 0.35;
	return 6 + Math.abs(n) * 22;
});

const BAR_IDS = Array.from(
	{ length: BAR_COUNT },
	(_, i) => `entry-audio-bar-${i}`,
);

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${String(s).padStart(2, "0")}`;
}

type EntryAudioPlayerProps = {
	src: string;
	accentColor: string;
	className?: string;
};

export function EntryAudioPlayer({
	src,
	accentColor,
	className,
}: EntryAudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	const progress = duration > 0 ? currentTime / duration : 0;

	const togglePlay = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) {
			void audio.play();
		} else {
			audio.pause();
		}
	}, []);

	const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
		const audio = audioRef.current;
		if (!audio || !duration) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const ratio = Math.min(
			1,
			Math.max(0, (e.clientX - rect.left) / rect.width),
		);
		audio.currentTime = ratio * duration;
	};

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onEnded = () => setPlaying(false);
		const onTimeUpdate = () => setCurrentTime(audio.currentTime);
		const onLoadedMetadata = () => setDuration(audio.duration);
		const onDurationChange = () => setDuration(audio.duration);

		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("ended", onEnded);
		audio.addEventListener("timeupdate", onTimeUpdate);
		audio.addEventListener("loadedmetadata", onLoadedMetadata);
		audio.addEventListener("durationchange", onDurationChange);

		return () => {
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("timeupdate", onTimeUpdate);
			audio.removeEventListener("loadedmetadata", onLoadedMetadata);
			audio.removeEventListener("durationchange", onDurationChange);
		};
	}, [src]);

	useEffect(() => {
		setPlaying(false);
		setCurrentTime(0);
		setDuration(0);
	}, [src]);

	return (
		<div className={cn("flex w-full items-center gap-3", className)}>
			<audio ref={audioRef} src={src} preload="metadata" className="hidden">
				<track kind="captions" />
			</audio>

			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={togglePlay}
				className="size-10 shrink-0 rounded hover:bg-transparent hover:opacity-80"
				aria-label={playing ? "Pause recording" : "Play recording"}
			>
				{playing ? (
					<Pause
						className="size-5"
						style={{ color: accentColor }}
						strokeWidth={2}
					/>
				) : (
					<Play
						className="size-5"
						style={{ color: accentColor }}
						strokeWidth={2}
					/>
				)}
			</Button>

			<div
				role="slider"
				aria-label="Playback position"
				aria-valuemin={0}
				aria-valuemax={duration}
				aria-valuenow={currentTime}
				tabIndex={0}
				onClick={handleSeek}
				onKeyDown={(e) => {
					const audio = audioRef.current;
					if (!audio || !duration) return;
					if (e.key === "ArrowRight") {
						audio.currentTime = Math.min(duration, audio.currentTime + 2);
					} else if (e.key === "ArrowLeft") {
						audio.currentTime = Math.max(0, audio.currentTime - 2);
					}
				}}
				className="relative flex h-[55px] min-w-0 max-w-[300px] flex-1 cursor-pointer items-end overflow-hidden rounded-[10px] border border-[#c7c7c7] bg-white px-1 pt-2 pb-1.5"
			>
				<div className="flex size-full items-end justify-around gap-px px-0.5">
					{BAR_IDS.map((barId, i) => {
						const h = BAR_HEIGHTS[i] ?? 6;
						const barProgress = (i + 1) / BAR_COUNT;
						const active = barProgress <= progress;
						return (
							<div
								key={barId}
								className="w-[6px] shrink-0 rounded-sm transition-colors duration-150"
								style={{
									height: h,
									backgroundColor: active ? accentColor : "#c7c7c7",
									opacity: active && playing ? 1 : active ? 0.85 : 0.55,
								}}
							/>
						);
					})}
				</div>
				<span className="pointer-events-none absolute right-2 bottom-1 text-[#525252] text-[11px] tabular-nums leading-none">
					{formatTime(currentTime)}
					<span className="text-[#a6a6a6]"> / {formatTime(duration)}</span>
				</span>
			</div>
		</div>
	);
}
