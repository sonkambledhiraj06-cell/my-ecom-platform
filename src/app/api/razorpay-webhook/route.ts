import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!signature || !secret || !serviceRoleKey || !supabaseUrl) {
    return Response.json({ error: "Webhook is not configured" }, { status: 500 });
  }

  const payload = await request.text();
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex");
  const signaturesMatch = signature.length === expectedSignature.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!signaturesMatch) {
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(payload) as { event?: string; payload?: { subscription?: { entity?: { id?: string; current_end?: number } } } };
    const subscription = event.payload?.subscription?.entity;
    if (!subscription?.id) return Response.json({ status: "ignored" });

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const update = event.event === "subscription.charged"
      ? { status: "active", current_period_end: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null }
      : event.event === "subscription.halted" || event.event === "subscription.cancelled"
        ? { status: "expired" }
        : null;

    if (!update) return Response.json({ status: "ignored" });
    const { error } = await supabase.from("subscriptions").update(update).eq("razorpay_subscription_id", subscription.id);
    if (error) throw error;
    return Response.json({ status: "success" });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, { status: 500 });
  }
}
