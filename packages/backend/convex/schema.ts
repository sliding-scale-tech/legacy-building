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

export default defineSchema({
	users: defineTable({
		clerkId: v.string(),
		email: v.string(),
		name: v.string(),
		role: v.union(v.literal("admin"), v.literal("user")),
		profilePictureId: v.optional(v.id("_storage")),
		deviceInfo: v.optional(deviceInfoValidator),
		agreedToTermsAt: v.optional(v.number()),
		stripeCustomerId: v.optional(v.string()),
		subscriptionStatus: v.optional(userSubscriptionStatusValidator),
	})
		.index("by_clerk_id", ["clerkId"])
		.index("by_email", ["email"])
		.index("by_stripe_customer_id", ["stripeCustomerId"]),
});
