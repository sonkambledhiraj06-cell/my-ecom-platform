"use client";

import { useState } from "react";
import { Package, Search } from "lucide-react";
import { StoreNavbar } from "@/components/store/store-navbar";
import { OrderTracker, type Order } from "@/components/store/order-tracker";
import { createClient } from "@/lib/supabase/client";

export default function TrackOrderPage() {
  const [searchValue, setSearchValue] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .or(`order_number.eq.${searchValue},customer_phone.like.%${searchValue}%`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setOrder(data[0] as Order);
      } else {
        setError("No order found with that order number or phone number.");
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StoreNavbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-600 mb-6">
          Enter your order number or phone number to track your order status.
        </p>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Order number or phone number"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchValue.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={18} />
            {loading ? "Searching..." : "Track"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {order && <OrderTracker order={order} />}
      </div>
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} AiD Stationery & Gifts. All rights reserved.
        </div>
      </footer>
    </>
  );
}
