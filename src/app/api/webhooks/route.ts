import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Webhook handler
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Missing Clerk SIGNING_SECRET in .env");
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Verification error", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, first_name, image_url } = evt.data;

    try {
      await prisma.user.upsert({
        where: { clerkUserId: id },
        update: {
          email: email_addresses[0].email_address,
          name: first_name,
          imageUrl: image_url,
        },
        create: {
          clerkUserId: id,
          email: email_addresses[0].email_address,
          name: first_name,
          imageUrl: image_url,
        },
      });

      console.log(`✅ Synced Clerk user ${id} to Prisma`);
      return new Response("User synced", { status: 201 });
    } catch (err) {
      console.error("❌ Error storing user in database:", err);
      return new Response("Database error", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
