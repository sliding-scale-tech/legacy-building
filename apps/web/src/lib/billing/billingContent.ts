import type { LucideIcon } from "lucide-react";
import { BookOpen, Camera, Cloud, FileText, Mic, Pencil } from "lucide-react";

export type BillingPlanChoice = "trial" | "monthly" | "annual";

/** Light background for the subscribed-user billing management page. */
export const BILLING_MANAGE_BG = "#f5f5f5";

export const BILLING_PAGE_BG = "#1a4540";

/** Feature bullets on the active-plan card (matches billing management mockup). */
export const MANAGE_PLAN_FEATURES = [
	"Unlimited Journal Entries",
	"Voice recording",
	"Add a photo to each entry",
	"PDF Export",
	"Secure cloud backup",
] as const;

export const BILLING_FEATURES: {
	icon: LucideIcon;
	title: string;
	description: string;
}[] = [
	{
		icon: Pencil,
		title: "Unlimited journal entries",
		description: "Write, save, and revisit your stories",
	},
	{
		icon: Mic,
		title: "Voice recording",
		description: "Capture moments in your own words",
	},
	{
		icon: Camera,
		title: "Add a photo to each entry",
		description: "One photo per entry to bring memories to life",
	},
	{
		icon: FileText,
		title: "PDF export",
		description: "Download any entry as a PDF",
	},
	{
		icon: BookOpen,
		title: "Turn entries into a printed book",
		description: "Order a physical or hardcover journal",
	},
	{
		icon: Cloud,
		title: "Secure cloud backup",
		description: "Private, safe, and always accessible",
	},
];

export const TRIAL_STEPS = [
	{
		label: "Today",
		description: "Start writing. No charge.",
		done: true,
	},
	{
		label: "Day 5",
		description: "Reminder sent. Review anytime.",
		done: false,
	},
	{
		label: "Day 7",
		description: "$3.99/month billed monthly",
		done: false,
	},
] as const;
