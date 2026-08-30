import { createClient } from "@/lib/supabase/server";

interface WhatsAppMessageRequest {
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount?: number;
  action: string;
}

export async function POST(request: Request) {
  try {
    const body: WhatsAppMessageRequest = await request.json();
    const { orderId, customerName, customerPhone, action } = body;

    if (!orderId || !customerName || !customerPhone || !action) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Format phone number (remove +91 or 0 prefix, add 91)
    let cleanPhone = customerPhone.replace(/[\s-]/g, "");
    if (cleanPhone.startsWith("+91")) cleanPhone = cleanPhone.slice(3);
    if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.slice(1);
    if (!cleanPhone.startsWith("91")) cleanPhone = "91" + cleanPhone;

    let message = "";

    switch (action) {
      case "order_confirmed":
        message = `Hello ${customerName}! ✅ Your order *${orderId}* has been confirmed. You will be updated on its status via WhatsApp. Thank you for shopping with AiD Stationery & Gifts!`;
        break;
      case "order_shipped":
        message = `Hello ${customerName}! 📦 Your order *${orderId}* has been shipped. Tracking details will be shared soon. Thank you!`;
        break;
      case "order_delivered":
        message = `Hello ${customerName}! 🎉 Your order *${orderId}* has been delivered. Share your experience with us!`;
        break;
      case "order_processing":
        message = `Hello ${customerName}! ⚙️ Your order *${orderId}* is being processed and will be packed soon.`;
        break;
      default:
        message = `Hello ${customerName}! Order *${orderId}* status: ${action}`;
    }

    const token = process.env.WHATSAPP_CLOUD_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const version = process.env.WHATSAPP_API_VERSION || "v19.0";

    if (!token || !phoneNumberId) {
      console.warn("WhatsApp credentials not configured. Skipping notification.");
      return Response.json({
        success: true,
        message: "Order notification skipped (WhatsApp not configured)",
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "text",
          text: { body: message },
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API error:", result);
      return Response.json(
        { error: result.error?.message || "WhatsApp API call failed" },
        { status: response.status },
      );
    }

    // Log notification in database
    const supabase = await createClient();
    await supabase.from("notifications").insert({
      order_id: orderId,
      customer_phone: cleanPhone,
      message,
      channel: "whatsapp",
      status: "sent",
    });

    return Response.json({ success: true, result });
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
