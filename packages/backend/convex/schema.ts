import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const deviceInfoValidator = v.object({
	userAgent: v.optional(v.string()),
	browserName: v.optional(v.string()),
	browserVersion: v.optional(v.string()),
	deviceType: v.optional(v.string()),
	isMobile: v.optional(v.boolean()),
	ipAddress: v.optional(v.string()),
	city: v.optional(v.string()),
	country: v.optional(v.string()),
	language: v.optional(v.string()),
	capturedAt: v.number(),
});

const userSubscriptionStatusValidator = v.union(
	v.literal("active"),
	v.literal("trialing"),
	v.literal("grace_period"),
	v.literal("canceled"),
	v.literal("none"),
);

const accountStatusValidator = v.union(
	v.literal("active"),
	v.literal("suspended"),
);

export const journalType = v.union(
	v.literal("my_story"),
	v.literal("their_story"),
);

export default defineSchema({
	users: defineTable({
		clerkId: v.string(),
		email: v.string(),
		name: v.string(),
		role: v.union(v.literal("admin"), v.literal("user")),
		profilePictureId: v.optional(v.id("_storage")),
		deviceInfo: v.optional(deviceInfoValidator),
		agreedToTermsAt: v.optional(v.number()),
		welcomeCompletedAt: v.optional(v.number()),
		stripeCustomerId: v.optional(v.string()),
		subscriptionStatus: v.optional(userSubscriptionStatusValidator),
		accountStatus: v.optional(accountStatusValidator),
	})
		.index("by_clerk_id", ["clerkId"])
		.index("by_email", ["email"])
		.index("by_stripe_customer_id", ["stripeCustomerId"]),

	journals: defineTable({
		userId: v.string(),
		title: v.string(),
		dateMs: v.number(),
		type: journalType,
		dedication: v.optional(v.string()),
		coverImageUrl: v.optional(v.string()),
		coverImageId: v.optional(v.id("_storage")),
		updatedAtMs: v.optional(v.number()),
		/** Manual library order within a story tab (lower = earlier). */
		sortOrder: v.optional(v.number()),
	})
		.index("by_userId", ["userId"])
		.index("by_userId_and_type", ["userId", "type"]),

	journalEntries: defineTable({
		userId: v.string(),
		journalId: v.id("journals"),
		title: v.string(),
		dateMs: v.number(),
		body: v.optional(v.string()),
		mode: v.union(v.literal("writing"), v.literal("recording")),
		imageUrl: v.optional(v.string()),
		audioUrl: v.optional(v.string()),
		imageId: v.optional(v.id("_storage")),
		audioId: v.optional(v.id("_storage")),
	})
		.index("by_journalId", ["journalId"])
		.index("by_userId", ["userId"]),
});
