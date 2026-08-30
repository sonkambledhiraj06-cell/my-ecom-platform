"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, AlertCircle } from "lucide-react";
import Link from "next/link";
import { StoreNavbar } from "@/components/store/store-navbar";
import { useCart } from "@/context/cart-context";
import { CheckoutForm, type CheckoutFormData } from "@/components/store/checkout-form";

declare global {
  interface Window { Razorpay: any; }
}

export default function CheckoutPage() {
  const { cart, totalAmount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const shippingFee = 50;
  const shippingThreshold = 500;
  const isEligibleForFreeShipping = totalAmount >= shippingThreshold;
  const finalTotal = totalAmount + (isEligibleForFreeShipping ? 0 : shippingFee);

  useEffect(() => {
    const loadRazorpay = () => new Promise<void>((res, rej) => {
      if (window.Razorpay) { res(); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => res();
      script.onerror = () => rej(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });
    loadRazorpay().catch(err => console.error("Razorpay SDK error:", err));
  }, []);

  const verifyPayment = useCallback(async (orderId:string, rzpResp:any) => {
    try {
      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          razorpay_payment_id: rzpResp.razorpay_payment_id,
          razorpay_order_id: rzpResp.razorpay_order_id,
          razorpay_signature: rzpResp.razorpay_signature,
        }),
      });
      const result = await verifyRes.json();
      if (result.success) { clearCart(); window.location.href = "/checkout/success?order="+orderId; }
      else { setError("Payment verification failed. Please try again."); }
    } catch { setError("Payment verification failed. Please contact support."); }
  }, [clearCart]);

  const handleCheckout = useCallback(async (formData: CheckoutFormData) => {
    if (cart.length === 0) { setError("Your cart is empty"); return; }
    if (typeof window.Razorpay === "undefined") {
      setError("Payment gateway not loaded. Please refresh and try again."); return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, customer: formData, total: finalTotal }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create order");
      if (result.razorpay_order_id) {
        const options: any = {
          key: result.razorpay_key_id,
          order_id: result.razorpay_order_id,
          amount: result.amount,
          currency: "INR",
          name: "AiD Stationery & Gifts",
          description: "Order Payment",
          prefill: { name: formData.name, contact: formData.phone, email: formData.email },
          handler: (response: any) => verifyPayment(result.order_id, response),
          modal: { ondismiss: () => setIsProcessing(false) },
          theme: { color: "#7c3aed" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        clearCart();
        window.location.href = "/checkout/success?order=" + result.order_id;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  }, [cart, finalTotal, clearCart, verifyPayment]);

  if (cart.length === 0) {
    return (<><StoreNavbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">Your cart is empty</h2>
          <Link href="/products" className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-purple-700">Continue Shopping</Link>
        </div>
      </div>
    </>);
  }

  return (<><StoreNavbar />
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
      <p className="text-gray-600 mb-6">Complete your order details below and proceed to secure payment.</p>
      <div className="mb-6 rounded-xl border border-purple-100 bg-purple-50 p-4">
        <p className="text-sm font-medium text-purple-800">
          Order Total: ₹{finalTotal.toLocaleString("en-IN")}
          {!isEligibleForFreeShipping && " (incl. ₹50 shipping)"}
        </p>
      </div>
      {error && (<div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 mb-4 text-sm text-red-700"><AlertCircle size={18} /> {error}</div>)}
      <CheckoutForm totalAmount={finalTotal} onSubmit={handleCheckout} isProcessing={isProcessing} />
      <p className="mt-6 text-center text-xs text-gray-500">
        By completing this order, you agree to our terms of service and privacy policy.
      </p>
    </div>
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
        © {new Date().getFullYear()} AiD Stationery & Gifts. All rights reserved.
      </div>
    </footer>
  </>);
}
