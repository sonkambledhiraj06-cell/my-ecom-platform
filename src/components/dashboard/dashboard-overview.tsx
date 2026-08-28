"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalUsers: number;
  inventoryValue: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  selling_price?: number | string | null;
  price?: number | string | null;
  stock_level?: number | string | null;
  stock?: number | string | null;
}

const numberValue = (value: number | string | null | undefined) => Number(value ?? 0) || 0;

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, lowStockItems: 0, totalUsers: 0, inventoryValue: 0 });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const [{ data: products, count: productCount, error: productsError }, { count: userCount, error: usersError }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact" }).order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      if (productsError) throw productsError;
      if (usersError) throw usersError;

      const productRecords = (products ?? []) as Product[];
      const lowStockItems = productRecords.filter((product) => numberValue(product.stock_level ?? product.stock) < 5).length;
      const inventoryValue = productRecords.reduce((total, product) => total + numberValue(product.selling_price ?? product.price) * numberValue(product.stock_level ?? product.stock), 0);
      setStats({ totalProducts: productCount ?? 0, lowStockItems, totalUsers: userCount ?? 0, inventoryValue });
      setRecentProducts(productRecords.slice(0, 5));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchOverviewData);
  }, [fetchOverviewData]);

  const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-6 md:p-10">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center"><div><h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Dashboard Overview</h1><p className="mt-1 text-sm text-gray-500">Real-time performance metrics and inventory monitoring.</p></div><button type="button" onClick={() => void fetchOverviewData()} className="relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black"><RefreshCw size={16} />Refresh Metrics</button></header>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Total Products" value={loading ? "..." : String(stats.totalProducts)} note="Active in Inventory" /><StatCard label="Inventory Value" value={loading ? "..." : money(stats.inventoryValue)} note="Estimated Valuation" valueClassName="text-emerald-600" /><StatCard label="Low Stock Alerts" value={loading ? "..." : String(stats.lowStockItems)} note="Items below threshold (<5)" valueClassName="text-amber-500" /><StatCard label="Registered Users" value={loading ? "..." : String(stats.totalUsers)} note="System User Accounts" valueClassName="text-purple-600" /></div>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-gray-100 p-6"><h2 className="text-lg font-bold text-gray-800">Recently Added Products</h2><Link href="/dashboard/products" className="text-xs font-semibold text-blue-600 hover:underline">View All Products →</Link></div>{loading ? <div className="p-8 text-center text-gray-400">Loading catalog...</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-400"><tr><th className="p-4">Product</th><th className="p-4">SKU</th><th className="p-4">Price</th><th className="p-4 text-right">Stock</th></tr></thead><tbody className="divide-y divide-gray-100">{recentProducts.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-gray-400">No products available.</td></tr> : recentProducts.map((product) => { const price = numberValue(product.selling_price ?? product.price); const stock = numberValue(product.stock_level ?? product.stock); return <tr key={product.id} className="transition hover:bg-gray-50/80"><td className="p-4 font-semibold text-gray-800">{product.name}</td><td className="p-4 font-mono text-xs text-gray-500">{product.sku}</td><td className="p-4 font-medium text-gray-700">{money(price)}</td><td className="p-4 text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stock < 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{stock} units</span></td></tr>; })}</tbody></table></div>}</section>
    </div>
  );
}

function StatCard({ label, value, note, valueClassName = "text-gray-800" }: { label: string; value: string; note: string; valueClassName?: string }) { return <article className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><div><p className="text-xs font-bold uppercase text-gray-400">{label}</p><h2 className={`mt-2 text-3xl font-extrabold ${valueClassName}`}>{value}</h2></div><span className="mt-4 block text-xs font-medium text-gray-500">{note}</span></article>; }
