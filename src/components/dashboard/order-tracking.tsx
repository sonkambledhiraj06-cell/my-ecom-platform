"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Filter, Loader2, Search, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type OrderStatus = "received" | "processing" | "shipped" | "delivered";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  amount: number;
  payment_status: string;
  status: OrderStatus;
  source: string | null;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
}

const statusOptions: OrderStatus[] = ["received", "processing", "shipped", "delivered"];

export default function OrderTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setOrders((data ?? []) as Order[]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchOrders);
  }, [fetchOrders]);

  const updateOrder = async (order: Order, changes: Partial<Order>) => {
    setSavingOrderId(order.id);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("orders")
        .update(changes)
        .eq("id", order.id);
      if (updateError) throw updateError;
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id ? { ...currentOrder, ...changes } : currentOrder,
        ),
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update order");
    } finally {
      setSavingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.tracking_number?.toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "all" || order.status === statusFilter);
    });
  }, [orders, searchQuery, statusFilter]);

  const countByStatus = (status: OrderStatus) => orders.filter((order) => order.status === status).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Orders &amp; Tracking</h2>
        <p className="mt-1 text-xs text-gray-500">Update fulfillment status and manage shipment tracking details.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Received" value={`${orders.length} Orders`} />
        <SummaryCard label="Processing" value={`${countByStatus("processing")} Orders`} />
        <SummaryCard label="In Transit" value={`${countByStatus("shipped")} Shipped`} />
        <SummaryCard label="Completed" value={`${countByStatus("delivered")} Delivered`} />
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} aria-hidden />
            <input type="search" placeholder="Search order, customer, tracking..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-2"><Filter size={16} className="text-gray-400" aria-hidden /><select aria-label="Filter orders by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"><option value="all">All Orders</option>{statusOptions.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></div>
          <button type="button" onClick={() => void fetchOrders()} className="relative z-10 cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">Refresh</button>
        </div>

        {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500"><Loader2 className="animate-spin" size={20} />Loading orders...</div> : error ? <div className="p-12 text-center text-sm text-red-600">{error}</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3.5">Order</th><th className="px-5 py-3.5">Customer</th><th className="px-5 py-3.5">Amount</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Tracking</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredOrders.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-gray-500">No orders found.</td></tr> : filteredOrders.map((order) => <tr key={order.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-mono text-xs font-semibold">{order.order_number}</td><td className="px-5 py-4"><div className="font-semibold">{order.customer_name}</div><div className="text-xs text-gray-500">{order.customer_phone || "No phone"}</div></td><td className="px-5 py-4 font-bold">₹{order.amount}</td><td className="px-5 py-4"><select aria-label={`Update status for ${order.order_number}`} value={order.status} disabled={savingOrderId === order.id} onChange={(event) => void updateOrder(order, { status: event.target.value as OrderStatus })} className="rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none focus:border-blue-500">{statusOptions.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></td><td className="px-5 py-4"><div className="flex min-w-64 items-center gap-2"><Truck size={15} className="text-gray-400" aria-hidden /><input aria-label={`Carrier for ${order.order_number}`} placeholder="Carrier" defaultValue={order.carrier ?? ""} onBlur={(event) => { if (event.target.value !== (order.carrier ?? "")) void updateOrder(order, { carrier: event.target.value || null }); }} className="w-24 rounded border px-2 py-1 text-xs" /><input aria-label={`Tracking number for ${order.order_number}`} placeholder="Tracking number" defaultValue={order.tracking_number ?? ""} onBlur={(event) => { if (event.target.value !== (order.tracking_number ?? "")) void updateOrder(order, { tracking_number: event.target.value || null }); }} className="w-32 rounded border px-2 py-1 text-xs" />{order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" aria-label={`Open tracking for ${order.order_number}`}><ExternalLink size={15} /></a>}</div></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase text-gray-500">{label}</p><h3 className="mt-1 text-lg font-bold text-gray-900">{value}</h3></article>;
}
