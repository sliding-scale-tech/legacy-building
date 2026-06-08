import { PageLoader } from "@legacy-building/ui/components/page-loader";

type JournalSidebarWaitOverlayProps = {
	message: string;
};

export function JournalSidebarWaitOverlay({
	message,
}: JournalSidebarWaitOverlayProps) {
	return (
		<div className="absolute inset-0 z-20 flex items-center justify-center bg-background/92 backdrop-blur-[2px]">
			<PageLoader
				message={message}
				overlay={false}
				size={140}
				className="gap-3 py-0"
			/>
		</div>
	);
}
