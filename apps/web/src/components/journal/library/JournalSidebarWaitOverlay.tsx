import { PageLoader } from "@legacy-building/ui/components/page-loader";

type JournalSidebarWaitOverlayProps = {
	message: string;
};

export function JournalSidebarWaitOverlay({
	message,
}: JournalSidebarWaitOverlayProps) {
	return (
		<div
			className="absolute inset-0 z-20 flex items-center justify-center bg-white/92 backdrop-blur-[2px]"
			role="status"
			aria-live="polite"
			aria-busy="true"
		>
			<PageLoader
				message={message}
				overlay={false}
				size={140}
				className="gap-3 py-0"
			/>
		</div>
	);
}
