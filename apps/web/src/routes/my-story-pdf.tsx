import { createFileRoute } from "@tanstack/react-router";

import { MyStoryPdfApp } from "@/features/my-story-pdf/MyStoryPdfApp";

export const Route = createFileRoute("/my-story-pdf")({
	component: MyStoryPdfApp,
});
