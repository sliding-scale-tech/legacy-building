import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { query } from "../_generated/server";
import {
	buildSubscriberPredicate,
	buildUserListPredicate,
	effectiveAccountStatus,
	normalizeSearchQuery,
	paginateUsersFiltered,
	requireAdmin,
	toAdminUserSummary,
	userMatchesSearch,
} from "./helpers";

/** Paginated user list for admin (use with `usePaginatedQuery`). */
export const listUsers = query({
	args: {
		paginationOpts: paginationOptsValidator,
		search: v.optional(v.string()),
		accountStatus: v.optional(
			v.union(v.literal("active"), v.literal("suspended")),
		),
		role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx);

		const search = args.search?.trim() ?? "";
		const hasFilters =
			Boolean(search) || Boolean(args.accountStatus) || Boolean(args.role);

		if (!hasFilters) {
			const result = await ctx.db
				.query("users")
				.order("desc")
				.paginate(args.paginationOpts);
			return {
				...result,
				page: result.page.map(toAdminUserSummary),
			};
		}

		return await paginateUsersFiltered(
			ctx,
			args.paginationOpts,
			buildUserListPredicate({
				search: search || undefined,
				accountStatus: args.accountStatus,
				role: args.role,
			}),
		);
	},
});

/** Typeahead suggestions while searching users (admin only). */
export const searchUserSuggestions = query({
	args: { query: v.string() },
	handler: async (ctx, { query: rawQuery }) => {
		await requireAdmin(ctx);

		const q = normalizeSearchQuery(rawQuery);
		if (q.length < 2) {
			return [];
		}

		const seen = new Set<string>();
		const suggestions: ReturnType<typeof toAdminUserSummary>[] = [];

		const pushUser = (user: Parameters<typeof toAdminUserSummary>[0]) => {
			if (seen.has(user._id)) return;
			if (!userMatchesSearch(user, q)) return;
			seen.add(user._id);
			suggestions.push(toAdminUserSummary(user));
		};

		const exactEmail = await ctx.db
			.query("users")
			.withIndex("by_email", (ix) => ix.eq("email", q))
			.unique();
		if (exactEmail) pushUser(exactEmail);

		const recentBatch = await ctx.db.query("users").order("desc").take(200);
		for (const user of recentBatch) {
			if (suggestions.length >= 8) break;
			pushUser(user);
		}

		return suggestions.slice(0, 8);
	},
});

export const getUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, { userId }) => {
		await requireAdmin(ctx);

		const user = await ctx.db.get(userId);
		if (!user) {
			return null;
		}

		const journalCount = (
			await ctx.db
				.query("journals")
				.withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
				.collect()
		).length;

		const entryCount = (
			await ctx.db
				.query("journalEntries")
				.withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
				.collect()
		).length;

		return {
			...toAdminUserSummary(user),
			journalCount,
			entryCount,
		};
	},
});

export const platformInsights = query({
	args: {},
	handler: async (ctx) => {
		await requireAdmin(ctx);

		const users = await ctx.db.query("users").collect();
		const journals = await ctx.db.query("journals").collect();
		const entries = await ctx.db.query("journalEntries").collect();

		let activeAccounts = 0;
		let suspendedAccounts = 0;
		let welcomeCompleted = 0;
		let termsAgreed = 0;
		let adminCount = 0;

		const subscriptionBreakdown = {
			active: 0,
			trialing: 0,
			grace_period: 0,
			canceled: 0,
			none: 0,
			unset: 0,
		};

		for (const user of users) {
			if (user.role === "admin") adminCount += 1;
			if (effectiveAccountStatus(user) === "suspended") {
				suspendedAccounts += 1;
			} else {
				activeAccounts += 1;
			}
			if (user.welcomeCompletedAt) welcomeCompleted += 1;
			if (user.agreedToTermsAt) termsAgreed += 1;

			const sub = user.subscriptionStatus;
			if (!sub) {
				subscriptionBreakdown.unset += 1;
			} else {
				subscriptionBreakdown[sub] += 1;
			}
		}

		return {
			totalUsers: users.length,
			activeAccounts,
			suspendedAccounts,
			adminCount,
			welcomeCompleted,
			termsAgreed,
			totalJournals: journals.length,
			totalEntries: entries.length,
			subscriptionActive: subscriptionBreakdown.active,
			subscriptionCanceled: subscriptionBreakdown.canceled,
		};
	},
});

/** Paginated subscribers (active/canceled only; use with `usePaginatedQuery`). */
export const listSubscribers = query({
	args: {
		paginationOpts: paginationOptsValidator,
		search: v.optional(v.string()),
		status: v.optional(v.union(v.literal("active"), v.literal("canceled"))),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx);

		const search = args.search?.trim() ?? "";

		return await paginateUsersFiltered(
			ctx,
			args.paginationOpts,
			buildSubscriberPredicate({
				search: search || undefined,
				status: args.status,
			}),
		);
	},
});
