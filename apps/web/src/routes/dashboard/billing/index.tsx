import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { DashboardBillingPage } from "@/features/billing/DashboardBillingPage";

const billingSearchSchema = z.object({
	checkout: z.enum(["success", "canceled"]).optional(),
	subscribe: z.enum(["required"]).optional(),
});

export const Route = createFileRoute("/dashboard/billing/")({
	validateSearch: billingSearchSchema,
	component: DashboardBillingPage,
});
