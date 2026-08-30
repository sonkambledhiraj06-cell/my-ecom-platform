"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Package } from "lucide-react";
import { StoreNavbar } from "@/components/store/store-navbar";
import { createClient } from "@/lib/supabase/client";

interface Order {
  order_number: string;
  amount: number;
  status: string;
  payment_status: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select("order_number, amount, status, payment_status")
          .eq("id", orderId)
          .single();

        if (!error && data) {
          setOrder(data as Order);
        }
      };
      void fetchOrder();
    }
  }, [orderId]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for your order. We have received your order confirmation
          and a WhatsApp message with details will be sent shortly.
        </p>

        {order && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 mb-8 text-left">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Order #:</span>
                <span className="font-medium ml-1">{order.order_number}</span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium ml-1">₹{order.amount.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="font-medium ml-1 capitalize">{order.status}</span>
              </div>
              <div>
                <span className="text-gray-500">Payment:</span>
                <span className="font-medium ml-1 capitalize">{order.payment_status}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/track-order")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-purple-700"
          >
            <Package size={20} />
            Track Your Order
          </button>
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-purple-600 px-6 py-3 text-base font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <StoreNavbar />
      <Suspense>
        <CheckoutSuccessContent />
      </Suspense>
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} AiD Stationery & Gifts. All rights reserved.
        </div>
      </footer>
    </>
  );
}
