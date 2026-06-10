import { verifyWebhook } from "@clerk/backend/webhooks";
import { registerRoutes } from "@convex-dev/stripe";
import type { GenericActionCtx, GenericDataModel } from "convex/server";
import { httpRouter } from "convex/server";
import type Stripe from "stripe";
import { components, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import type { ClerkUser } from "./helpers";
import {
	getEmailAndName,
	getInitialNameFromClerk,
	roleFromClerkMetadata,
	storeClerkProfilePicture,
} from "./helpers";

const handleClerkWebhook = httpAction(async (ctx, request) => {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}
	const signingSecret = process.env.CLERK_WEBHOOK_SECRET;
	if (!signingSecret) {
		console.error(
			"Missing CLERK_WEBHOOK_SECRET in Convex environment variables.",
		);
		return new Response("Webhook signing secret not configured", {
			status: 500,
		});
	}

	let event: Awaited<ReturnType<typeof verifyWebhook>>;
	try {
		event = await verifyWebhook(request, { signingSecret });
	} catch (err) {
		console.error("Clerk webhook verification failed:", err);
		return new Response("Webhook verification failed", { status: 400 });
	}

	try {
		switch (event.type) {
			case "user.created":
			case "user.updated": {
				const clerkUser = event.data as ClerkUser;
				const { email } = getEmailAndName(clerkUser);
				if (!email) {
					console.warn("Clerk user webhook missing email:", clerkUser.id);
					break;
				}

				const name = getInitialNameFromClerk(clerkUser);

				const profilePictureId = await storeClerkProfilePicture(
					ctx,
					clerkUser.image_url,
				);

				await ctx.runMutation(internal.user.mutations.createOrUpdateFromClerk, {
					clerkId: clerkUser.id,
					email,
					name,
					profilePictureId,
					initialRole: roleFromClerkMetadata(clerkUser),
				});
				break;
			}
			case "user.deleted": {
				const id = (event.data as { id?: string })?.id;
				if (!id) {
					console.warn("user.deleted webhook missing id");
					break;
				}
				await ctx.runAction(internal.user.deleteAccount.purgeClerkUserById, {
					clerkId: id,
				});
				break;
			}
			default:
				console.log("Ignored Clerk webhook event:", event.type);
		}
	} catch (err) {
		console.error("Clerk webhook handler failed:", err);
		return new Response("Webhook handler failed", { status: 500 });
	}

	return new Response(null, { status: 200 });
});

const http = httpRouter();

http.route({
	path: "/clerk/register",
	method: "POST",
	handler: handleClerkWebhook,
});

/**
 * Mirror the authoritative subscription status (already synced into the Stripe
 * component's tables) onto our `users` table so the UI/access gates can read it
 * cheaply. Runs after the component's default sync.
 */
async function mirrorSubscriptionEvent(
	ctx: GenericActionCtx<GenericDataModel>,
	event:
		| Stripe.CustomerSubscriptionCreatedEvent
		| Stripe.CustomerSubscriptionUpdatedEvent
		| Stripe.CustomerSubscriptionDeletedEvent,
) {
	const subscription = event.data.object;
	const userId =
		typeof subscription.metadata?.userId === "string"
			? subscription.metadata.userId
			: undefined;
	const stripeCustomerId =
		typeof subscription.customer === "string"
			? subscription.customer
			: subscription.customer?.id;
	const stripeStatus =
		event.type === "customer.subscription.deleted"
			? "canceled"
			: subscription.status;

	await ctx.runMutation(internal.stripe.mutations.mirrorSubscriptionStatus, {
		clerkUserId: userId,
		stripeCustomerId,
		stripeStatus,
	});
}

// Stripe webhook handler at /stripe/webhook (signature verified by the component).
registerRoutes(http, components.stripe, {
	webhookPath: "/stripe/webhook",
	events: {
		"customer.subscription.created": mirrorSubscriptionEvent,
		"customer.subscription.updated": mirrorSubscriptionEvent,
		"customer.subscription.deleted": mirrorSubscriptionEvent,
	},
});

export default http;
