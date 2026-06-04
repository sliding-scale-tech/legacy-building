import { createClerkClient } from "@clerk/backend";
import { v } from "convex/values";

import { internalAction } from "../_generated/server";

export const syncClerkRole = internalAction({
	args: {
		clerkId: v.string(),
		role: v.union(v.literal("admin"), v.literal("user")),
	},
	handler: async (_ctx, { clerkId, role }) => {
		const secretKey = process.env.CLERK_SECRET_KEY;
		if (!secretKey) {
			throw new Error("CLERK_SECRET_KEY is not configured in Convex.");
		}

		const clerk = createClerkClient({ secretKey });
		await clerk.users.updateUserMetadata(clerkId, {
			publicMetadata: { role },
		});
	},
});
