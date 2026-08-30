"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Sparkles, AlertTriangle, Package, DollarSign, ShoppingCart, Users, TrendingUp, Target, Zap, Brain, ChevronRight, Database, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Product, numberValue, formatCurrency, calculateBusinessHealth, BusinessHealthScore, calculateProductScore } from "@/lib/product-types";
import { DemoDataControls } from "@/components/dashboard/demo-data-controls";

interface DashboardData {
  products: Product[];
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  inventoryValue: number;
  totalRevenue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  demoProductCount: number;
  productsWithVideo: number;
  productsWithoutDescription: number;
  healthScore: BusinessHealthScore;
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const [
        { data: products, count: productCount, error: productsError },
        { count: orderCount, error: ordersError },
        { count: customerCount, error: customersError },
      ] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      if (productsError) throw productsError;

      const productRecords = (products ?? []) as Product[];
      const totalOrders = orderCount ?? 0;
      const totalCustomers = customerCount ?? 0;

      let inventoryValue = 0;
      let totalRevenue = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;
      let inStockCount = 0;
      let demoProductCount = 0;
      let productsWithVideo = 0;
      let productsWithoutDescription = 0;

      for (const product of productRecords) {
        const stock = numberValue(product.stock_level);
        const price = numberValue(product.selling_price);
        const lowThreshold = numberValue(product.low_stock) || 5;

        inventoryValue += price * stock;

        if (stock <= 0) outOfStockCount++;
        else if (stock <= lowThreshold) lowStockCount++;
        else inStockCount++;

        if (product.is_demo) demoProductCount++;

        if (!product.description || product.description.trim().length < 20) {
          productsWithoutDescription++;
        }
      }

      const { data: videoData } = await supabase
        .from("product_videos")
        .select("product_id")
        .eq("status", "completed");

      if (videoData) {
        const uniqueProductIds = new Set(videoData.map((v) => v.product_id));
        productsWithVideo = uniqueProductIds.size;
      }

      const healthScore = calculateBusinessHealth(productRecords, totalOrders, totalCustomers);

      setData({
        products: productRecords,
        totalProducts: productCount ?? 0,
        totalOrders,
        totalCustomers,
        inventoryValue,
        totalRevenue,
        lowStockCount,
        outOfStockCount,
        inStockCount,
        demoProductCount,
        productsWithVideo,
        productsWithoutDescription,
        healthScore,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const getValue = (value: number | undefined, formatter?: (v: number) => string) => {
    if (loading) return "...";
    if (value === undefined || value === 0) return "No data yet";
    return formatter ? formatter(value) : String(value);
  };

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 md:p-10">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/70 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl flex items-center gap-2">
            <Brain className="text-purple-600" size={28} />
            AID AI Business Command Center
          </h1>
          <p className="mt-1 text-sm text-gray-500">AI-powered business operating system. Real-time metrics and intelligent insights.</p>
        </div>
        <button
          type="button"
          onClick={() => void fetchDashboardData()}
          className="relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black"
        >
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={20} className="text-purple-600" />
          <h2 className="text-base font-bold text-purple-900">Ask AID</h2>
        </div>
        <p className="text-sm text-purple-700 mb-3">&quot;What should I improve today?&quot;</p>
        <button
          type="button"
          onClick={() => {
            if (!data) return;
            const insights: string[] = [];
            if (data.lowStockCount > 0) insights.push(`${data.lowStockCount} products are low on stock`);
            if (data.productsWithoutDescription > 0) insights.push(`${data.productsWithoutDescription} products need better descriptions`);
            const needVideos = data.totalProducts - data.productsWithVideo;
            if (needVideos > 0) insights.push(`${needVideos} products have no marketing video`);
            if (insights.length === 0) insights.push("Your business metrics look healthy! Consider expanding your product catalog.");
            alert("AID Insights:\n\n" + insights.map((i) => `• ${i}`).join("\n"));
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700"
        >
          <Wand2 size={16} /> Ask AID
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          label="Total Products"
          value={getValue(data?.totalProducts)}
          note={data ? `${data.demoProductCount} demo products` : ""}
          icon={<Package size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          loading={loading}
        />
        <KPICard
          label="Inventory Value"
          value={data ? (data.inventoryValue > 0 ? formatCurrency(data.inventoryValue) : "No data yet") : "..."}
          note="Estimated Valuation"
          icon={<DollarSign size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
          loading={loading}
        />
        <KPICard
          label="Low Stock"
          value={getValue(data?.lowStockCount)}
          note="Items below threshold"
          icon={<AlertTriangle size={20} />}
          iconBg="bg-amber-50 text-amber-600"
          loading={loading}
        />
        <KPICard
          label="Orders"
          value={getValue(data?.totalOrders)}
          note="Total orders placed"
          icon={<ShoppingCart size={20} />}
          iconBg="bg-pink-50 text-pink-600"
          loading={loading}
        />
        <KPICard
          label="Customers"
          value={getValue(data?.totalCustomers)}
          note="Registered users"
          icon={<Users size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          loading={loading}
        />
        <KPICard
          label="In Stock"
          value={getValue(data?.inStockCount)}
          note="Products available"
          icon={<TrendingUp size={20} />}
          iconBg="bg-green-50 text-green-600"
          loading={loading}
        />
        <KPICard
          label="Out of Stock"
          value={getValue(data?.outOfStockCount)}
          note="Need restock"
          icon={<Package size={20} />}
          iconBg="bg-red-50 text-red-600"
          loading={loading}
        />
        <KPICard
          label="Videos Ready"
          value={getValue(data?.productsWithVideo)}
          note={`of ${data?.totalProducts ?? 0} products`}
          icon={<Zap size={20} />}
          iconBg="bg-indigo-50 text-indigo-600"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={16} className="text-purple-600" /> AI Business Health
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600" />
            </div>
          ) : data ? (
            <div className="flex flex-col items-center">
              <HealthRing score={data.healthScore.overall} />
              <div className="mt-4 grid grid-cols-3 gap-2 w-full">
                <HealthMetric label="Products" value={data.healthScore.products} />
                <HealthMetric label="Inventory" value={data.healthScore.inventory} />
                <HealthMetric label="Marketing" value={data.healthScore.marketing} />
                <HealthMetric label="Content" value={data.healthScore.content} />
                <HealthMetric label="Customers" value={data.healthScore.customers} />
                <HealthMetric label="Sales" value={data.healthScore.sales} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" /> AI Focus: What should you do now?
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-200 border-t-amber-600" />
            </div>
          ) : data ? (
            <div className="space-y-3">
              {data.lowStockCount > 0 && (
                <FocusItem
                  message={`${data.lowStockCount} products are below stock threshold`}
                  action="View Inventory"
                  href="/dashboard/products"
                />
              )}
              {data.productsWithoutDescription > 0 && (
                <FocusItem
                  message={`${data.productsWithoutDescription} products have incomplete descriptions`}
                  action="Fix Products"
                  href="/dashboard/products"
                />
              )}
              {data.outOfStockCount > 0 && (
                <FocusItem
                  message={`${data.outOfStockCount} products are out of stock`}
                  action="Restock Now"
                  href="/dashboard/products"
                />
              )}
              {data.totalProducts - data.productsWithVideo > 0 && (
                <FocusItem
                  message={`${data.totalProducts - data.productsWithVideo} products have no marketing video`}
                  action="Generate Videos"
                  href="/dashboard/products"
                />
              )}
              {data.totalProducts === 0 && (
                <FocusItem
                  message="Add your first product to get started"
                  action="Add Products"
                  href="/dashboard/products"
                />
              )}
              {data.lowStockCount === 0 && data.productsWithoutDescription === 0 && data.outOfStockCount === 0 && data.totalProducts > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-sm text-emerald-800 font-medium">All systems healthy! Your business metrics look great.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {data && data.products.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={16} className="text-blue-500" /> Product Intelligence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.products.slice(0, 8).map((product) => {
              const score = calculateProductScore(product);
              return (
                <div key={product.id} className="rounded-xl border border-gray-100 p-3 hover:border-blue-200 hover:shadow-md transition">
                  <div className="aspect-square w-full rounded-lg bg-gray-100 mb-3 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package size={32} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 font-mono">SKU: {product.sku}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(numberValue(product.selling_price))}</span>
                    <span className={`text-xs font-medium ${
                      score.overall >= 75 ? "text-emerald-600" :
                      score.overall >= 50 ? "text-amber-600" : "text-red-600"
                    }`}>
                      AI: {score.overall}%
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Stock: {numberValue(product.stock_level)}</span>
                    {product.is_demo && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Demo</span>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="mt-2 block text-center rounded-lg bg-blue-50 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <DemoDataControls />

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800">Recently Added Products</h2>
          <Link href="/dashboard/products" className="text-xs font-semibold text-blue-600 hover:underline">View All Products →</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading catalog...</div>
        ) : data && data.products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">AI Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.products.slice(0, 5).map((product) => {
                  const score = calculateProductScore(product);
                  return (
                    <tr key={product.id} className="transition hover:bg-gray-50/80">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {product.image_url ? (
                              <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package size={16} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{product.name}</p>
                            {product.is_demo && (
                              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Demo</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-500">{product.sku}</td>
                      <td className="p-4 font-medium text-gray-700">{formatCurrency(numberValue(product.selling_price))}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          numberValue(product.stock_level) <= 0 ? "bg-red-100 text-red-700" :
                          numberValue(product.stock_level) <= (numberValue(product.low_stock) || 5) ? "bg-amber-100 text-amber-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {numberValue(product.stock_level)} units
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-sm font-bold ${
                          score.overall >= 75 ? "text-emerald-600" :
                          score.overall >= 50 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {score.overall}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            No products available. Add products or seed demo data to get started.
          </div>
        )}
      </section>
    </div>
  );
}

function KPICard({ label, value, note, icon, iconBg, loading }: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  iconBg: string;
  loading: boolean;
}) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
      </div>
      <div className="mt-3">
        <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
        <h2 className={`mt-1 text-2xl font-extrabold ${loading ? "text-gray-300" : "text-gray-800"}`}>{value}</h2>
      </div>
      <span className="mt-2 block text-[10px] font-medium text-gray-500">{note}</span>
    </article>
  );
}

function HealthRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : score >= 25 ? "#f97316" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-gray-900">{score}%</span>
        <span className="text-[10px] text-gray-500">AI HEALTH</span>
      </div>
    </div>
  );
}

function HealthMetric({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? "text-emerald-600" : value >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <div className="text-center">
      <p className={`text-sm font-bold ${color}`}>{value}%</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function FocusItem({ message, action, href }: { message: string; action: string; href: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        <ChevronRight size={14} className="text-amber-500" />
        <span className="text-sm text-gray-700">{message}</span>
      </div>
      <Link href={href} className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition">
        {action}
      </Link>
    </div>
  );
}
