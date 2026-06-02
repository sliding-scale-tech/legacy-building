import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getByClerkIdForAdminCheck = internalQuery({
	args: { clerkId: v.string() },
	handler: async (ctx, { clerkId }) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
			.unique();
		if (!user) return null;
		return { _id: user._id, role: user.role };
	},
});

export const getByEmailForInvite = internalQuery({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const normalized = email.trim().toLowerCase();
		const user =
			(await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", normalized))
				.unique()) ??
			(await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", email.trim()))
				.unique());

		if (!user) return null;
		return { role: user.role };
	},
});
