import { brand } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const VISUALIZER_BAR_IDS = Array.from(
	{ length: 40 },
	(_, n) => `recorder-bar-${n}`,
);

type AudioRecorderFieldProps = {
	accentColor: string;
	value: File | null;
	onChange: (file: File | null) => void;
	invalid?: boolean;
};

/** Bubble recording row: 40px control, waveform box (max 300px), duration. */
export function AudioRecorderField({
	accentColor,
	value,
	onChange,
	invalid,
}: AudioRecorderFieldProps) {
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const streamRef = useRef<MediaStream | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const rafRef = useRef<number | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [recording, setRecording] = useState(false);
	const [duration, setDuration] = useState(0);
	const [bars, setBars] = useState<number[]>(() =>
		Array.from({ length: 40 }, () => 6),
	);

	const stopVisualizer = useCallback(() => {
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	}, []);

	const stopStream = useCallback(() => {
		stopVisualizer();
		for (const track of streamRef.current?.getTracks() ?? []) {
			track.stop();
		}
		streamRef.current = null;
		void audioContextRef.current?.close();
		audioContextRef.current = null;
		analyserRef.current = null;
	}, [stopVisualizer]);

	const drawVisualizer = useCallback(() => {
		const analyser = analyserRef.current;
		const canvas = canvasRef.current;
		if (!analyser || !canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const bufferLength = analyser.frequencyBinCount;
		const data = new Uint8Array(bufferLength);
		analyser.getByteFrequencyData(data);

		const barCount = 40;
		const nextBars: number[] = [];
		const step = Math.floor(bufferLength / barCount);
		for (let i = 0; i < barCount; i++) {
			const sample = data[i * step] ?? 0;
			nextBars.push(6 + (sample / 255) * 26);
		}
		setBars(nextBars);

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#c7c7c7";
		const barWidth = canvas.width / barCount;
		for (let i = 0; i < barCount; i++) {
			const h = nextBars[i] ?? 6;
			ctx.fillRect(i * barWidth + 1, canvas.height - h, barWidth - 2, h);
		}

		rafRef.current = requestAnimationFrame(drawVisualizer);
	}, []);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

			const audioContext = new AudioContext();
			audioContextRef.current = audioContext;
			const source = audioContext.createMediaStreamSource(stream);
			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			source.connect(analyser);
			analyserRef.current = analyser;

			const recorder = new MediaRecorder(stream);
			chunksRef.current = [];
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};
			recorder.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: "audio/webm" });
				const file = new File([blob], `recording-${Date.now()}.webm`, {
					type: blob.type || "audio/webm",
				});
				onChange(file);
				stopStream();
				setRecording(false);
			};
			mediaRecorderRef.current = recorder;
			recorder.start();
			setRecording(true);
			setDuration(0);
			drawVisualizer();
		} catch {
			stopStream();
			setRecording(false);
		}
	};

	const stopRecording = () => {
		mediaRecorderRef.current?.stop();
		mediaRecorderRef.current = null;
	};

	const toggleRecording = () => {
		if (recording) {
			stopRecording();
		} else {
			onChange(null);
			void startRecording();
		}
	};

	useEffect(() => {
		if (!recording) return;
		const interval = window.setInterval(() => {
			setDuration((d) => d + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, [recording]);

	useEffect(() => {
		if (!value || recording) return;
		const url = URL.createObjectURL(value);
		const audio = new Audio(url);
		const onLoaded = () => {
			if (Number.isFinite(audio.duration)) {
				setDuration(Math.max(1, Math.round(audio.duration)));
			}
			URL.revokeObjectURL(url);
		};
		audio.addEventListener("loadedmetadata", onLoaded);
		audio.load();
		return () => {
			audio.removeEventListener("loadedmetadata", onLoaded);
			URL.revokeObjectURL(url);
		};
	}, [value, recording]);

	useEffect(() => {
		return () => {
			if (mediaRecorderRef.current?.state === "recording") {
				mediaRecorderRef.current.stop();
			}
			stopStream();
		};
	}, [stopStream]);

	const displaySeconds =
		recording || value ? String(Math.max(duration, recording ? 0 : 1)) : "0";

	return (
		<div className="flex w-full flex-row flex-wrap items-center gap-3">
			<button
				type="button"
				onClick={toggleRecording}
				className="flex size-10 shrink-0 items-center justify-center rounded p-1 hover:opacity-80"
				style={{
					color: recording ? brand.destructive : accentColor || brand.alert,
				}}
				aria-label={recording ? "Stop recording" : "Start recording"}
			>
				{recording ? (
					<Pause className="size-8 fill-current" aria-hidden />
				) : (
					<Play className="size-8 fill-current" aria-hidden />
				)}
			</button>

			<div
				className={cn(
					"relative h-11 min-h-11 w-full min-w-[200px] max-w-[300px] flex-1 overflow-hidden rounded-[10px] border bg-white",
					invalid ? "border-[#b0200c]" : "border-[#c7c7c7]",
				)}
			>
				<canvas
					ref={canvasRef}
					width={300}
					height={44}
					className="absolute inset-0 size-full"
					aria-hidden
				/>
				<div className="absolute inset-0 flex items-end justify-around px-2 pb-1.5">
					{VISUALIZER_BAR_IDS.map((barId, i) => (
						<div
							key={barId}
							className="w-[5px] rounded-sm bg-[#c7c7c7]"
							style={{ height: bars[i] ?? 6 }}
						/>
					))}
				</div>
			</div>

			<span className="shrink-0 font-normal text-[#1a1a1a] text-sm tabular-nums leading-[1.4]">
				{displaySeconds}
			</span>
		</div>
	);
}
