import { createHmac } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    if (!order_id || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return Response.json({ error: "Missing payment verification fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (secret) {
      // Verify signature using webhook secret
      const generatedSignature = createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error("Payment signature mismatch:", {
          generated: generatedSignature,
          received: razorpay_signature,
        });
        return Response.json({ success: false, error: "Signature verification failed" }, { status: 401 });
      }
    }

    const supabase = await createClient();

    // Mark order as paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_id: razorpay_payment_id,
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("Payment status update error:", updateError);
      return Response.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Fetch order details for WhatsApp notification
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("order_number, customer_name, customer_phone, amount")
      .eq("id", order_id)
      .single();

    if (!orderError && order) {
      // Trigger WhatsApp confirmation via API (fire-and-forget)
      void fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/whatsapp/order-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.order_number,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          amount: order.amount,
          action: "order_confirmed",
        }),
      }).catch((err) => console.error("WhatsApp notification failed:", err));
    }

    return Response.json({ success: true, order_id });
  } catch (error) {
    console.error("Verify payment error:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
