import { createClient } from "@/lib/supabase/server";
import { createHmac } from "crypto";

// Simple Razorpay order creation - requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
const createRazorpayOrder = async (amount: number, orderId: string) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  const orderData = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency: "INR",
    receipt: orderId,
    notes: { order_id: orderId },
  };

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Razorpay order creation failed:", err);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Razorpay API error:", err);
    return null;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cart, customer, total } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address) {
      return Response.json({ error: "Customer details are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate order totals
    const itemsTotal = cart.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
    const shippingFee = total - itemsTotal;

    // Create order in Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        shipping_address: customer.address,
        amount: total,
        payment_status: "pending",
        status: "received",
        source: "website",
        order_items: cart.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          sku: item.sku,
        })),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return Response.json({ error: orderError.message }, { status: 500 });
    }

    const orderId = orderData?.id;

    // Deduct stock for each product in cart
    for (const item of cart) {
      const { data: product, error: fetchProductError } = await supabase
        .from("products")
        .select("stock_level, stock")
        .eq("id", item.id)
        .single();

      if (!fetchProductError && product) {
        const currentStock = Number(product.stock_level ?? product.stock ?? 0);
        const newStock = Math.max(0, currentStock - item.quantity);
        await supabase
          .from("products")
          .update({ stock_level: newStock, stock: newStock })
          .eq("id", item.id);
      }
    }

    // Create Razorpay order if API keys are available
    const razorpayOrder = await createRazorpayOrder(total, orderId);

    if (razorpayOrder) {
      return Response.json({
        success: true,
        order_id: orderId,
        order_number: orderNumber,
        razorpay_order_id: razorpayOrder.id,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      });
    }

    // If Razorpay is not configured, mark payment as pending (COD fallback)
    await supabase
      .from("orders")
      .update({ payment_status: "cod_pending" })
      .eq("id", orderId);

    return Response.json({
      success: true,
      order_id: orderId,
      order_number: orderNumber,
      message: "Order created. Payment will be collected on delivery.",
    });
  } catch (error) {
    console.error("Create order error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
