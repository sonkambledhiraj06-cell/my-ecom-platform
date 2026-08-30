"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { numberValue, formatCurrency } from "@/lib/product-types";

interface OrderRecord {
  amount: number | string | null;
  payment_status: string | null;
  status: string | null;
  source: string | null;
  created_at: string;
}

interface ProductRecord {
  cogs?: number | string | null;
  cost_cogs?: number | string | null;
  stock_level?: number | string | null;
  selling_price?: number | string | null;
  low_stock?: number | string | null;
}

interface Metrics {
  grossRevenue: number;
  cogs: number;
  adSpend: number;
  shippingCost: number;
  paymentGatewayFee: number;
  netProfit: number;
}

interface ChartData {
  revenueByMonth: { month: string; revenue: number }[];
  salesBySource: { source: string; count: number }[];
  inventoryDistribution: { label: string; count: number }[];
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    grossRevenue: 0,
    cogs: 0,
    adSpend: 0,
    shippingCost: 0,
    paymentGatewayFee: 0,
    netProfit: 0,
  });
  const [orderCount, setOrderCount] = useState(0);
  const [chartData, setChartData] = useState<ChartData>({
    revenueByMonth: [],
    salesBySource: [],
    inventoryDistribution: [
      { label: "In Stock", count: 0 },
      { label: "Low Stock", count: 0 },
      { label: "Out of Stock", count: 0 },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const [{ data: orders, error: ordersError }, { data: products, error: productsError }] = await Promise.all([
        supabase.from("orders").select("amount, payment_status, status, source, created_at"),
        supabase.from("products").select("cogs, cost_cogs, stock_level, selling_price, low_stock"),
      ]);
      if (ordersError) throw ordersError;
      if (productsError) throw productsError;

      const orderRecords = (orders ?? []) as OrderRecord[];
      const productRecords = (products ?? []) as ProductRecord[];

      const paidOrders = orderRecords.filter((o) => o.payment_status === "paid");
      const grossRevenue = paidOrders.reduce((total, order) => total + numberValue(order.amount), 0);
      const cogs = productRecords.reduce((total, product) => total + numberValue(product.cogs ?? product.cost_cogs), 0);
      const adSpend = 0;
      const shippingCost = orderRecords.length * 50;
      const paymentGatewayFee = grossRevenue * 0.02;
      const netProfit = grossRevenue - cogs - adSpend - shippingCost - paymentGatewayFee;

      setOrderCount(orderRecords.length);
      setMetrics({ grossRevenue, cogs, adSpend, shippingCost, paymentGatewayFee, netProfit });

      const monthlyRevenue: Record<string, number> = {};
      for (const order of paidOrders) {
        const month = new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + numberValue(order.amount);
      }
      const revenueByMonth = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));

      const sourceCounts: Record<string, number> = {};
      for (const order of orderRecords) {
        const source = order.source || "unknown";
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      }
      const salesBySource = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));

      let inStock = 0;
      let lowStock = 0;
      let outOfStock = 0;
      for (const product of productRecords) {
        const stock = numberValue(product.stock_level);
        const threshold = numberValue(product.low_stock) || 5;
        if (stock <= 0) outOfStock++;
        else if (stock <= threshold) lowStock++;
        else inStock++;
      }

      setChartData({
        revenueByMonth,
        salesBySource,
        inventoryDistribution: [
          { label: "In Stock", count: inStock },
          { label: "Low Stock", count: lowStock },
          { label: "Out of Stock", count: outOfStock },
        ],
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchAnalytics);
  }, [fetchAnalytics]);

  const exportReport = () => {
    const rows = [
      ["Metric", "Amount"],
      ["Gross Revenue", String(metrics.grossRevenue)],
      ["COGS", String(metrics.cogs)],
      ["Ad Spend", String(metrics.adSpend)],
      ["Shipping Cost", String(metrics.shippingCost)],
      ["Payment Gateway Fee", String(metrics.paymentGatewayFee)],
      ["Net Profit", String(metrics.netProfit)],
      ["Total Orders", String(orderCount)],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "financial-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalDeductions = metrics.cogs + metrics.adSpend + metrics.shippingCost + metrics.paymentGatewayFee;
  const netMargin = metrics.grossRevenue ? (metrics.netProfit / metrics.grossRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Analytics</h2>
          <p className="mt-1 text-xs text-gray-500">Real-time financial metrics and business intelligence.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void fetchAnalytics()} className="relative z-10 cursor-pointer rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Refresh</button>
          <button type="button" onClick={exportReport} disabled={loading} className="relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={16} />Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border bg-white p-12 text-sm text-gray-500">
          <Loader2 className="animate-spin" size={20} />Loading analytics...
        </div>
      ) : error ? (
        <div className="rounded-xl border bg-white p-12 text-center text-sm text-red-600">{error}</div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <ShieldCheck size={16} />Verified True Net Profit
                </span>
                <h3 className="mt-2 text-4xl font-extrabold">{formatCurrency(metrics.netProfit)}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Net Margin: <span className="font-bold text-emerald-400">{netMargin.toFixed(1)}%</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MetricHighlight label="Gross Revenue" value={metrics.grossRevenue} />
                <MetricHighlight label="Total Deductions" value={totalDeductions} valueClassName="text-red-400" />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="border-b pb-3 text-base font-bold text-gray-800">Operational Cost Breakdown</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CostCard label="Cost of Goods (COGS)" value={metrics.cogs} />
              <CostCard label="Ad Spend" value={metrics.adSpend} />
              <CostCard label="Logistics & Courier" value={metrics.shippingCost} />
              <CostCard label="Payment Gateway (2%)" value={metrics.paymentGatewayFee} />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Revenue Trend</h3>
              {chartData.revenueByMonth.length > 0 ? (
                <SimpleLineChart data={chartData.revenueByMonth} />
              ) : (
                <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                  No revenue data yet. Orders will appear here once placed.
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Sales by Channel</h3>
              {chartData.salesBySource.length > 0 ? (
                <SimpleBarChart data={chartData.salesBySource} />
              ) : (
                <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                  No order data yet. Orders will appear here once placed.
                </div>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-4">Inventory Distribution</h3>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <SimpleDonutChart data={chartData.inventoryDistribution} />
              <div className="space-y-3">
                {chartData.inventoryDistribution.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      item.label === "In Stock" ? "bg-emerald-500" :
                      item.label === "Low Stock" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MetricHighlight({ label, value, valueClassName = "text-white" }: { label: string; value: number; valueClassName?: string }) {
  return (
    <div className="min-w-[120px] rounded-xl border border-slate-700 bg-slate-800 p-4 text-center">
      <p className="text-[11px] font-semibold uppercase text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-bold ${valueClassName}`}>₹{value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
    </div>
  );
}

function CostCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border bg-gray-50/50 p-4">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <h4 className="mt-2 text-xl font-bold text-gray-900">₹{value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h4>
    </article>
  );
}

function SimpleLineChart({ data }: { data: { month: string; revenue: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const width = 100;
  const height = 100;

  const points = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * width,
    y: height - (d.revenue / maxRevenue) * height,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${pathD} L ${width} ${height} L 0 ${height} Z`} fill="url(#lineGradient)" />
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="#3b82f6" />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-gray-500">{d.month}</span>
        ))}
      </div>
    </div>
  );
}

function SimpleBarChart({ data }: { data: { source: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="w-full space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-20 truncate">{d.source}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.count / maxCount) * 100}%`, backgroundColor: colors[i % colors.length] }}
            />
          </div>
          <span className="text-xs font-bold text-gray-900 w-8 text-right">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

function SimpleDonutChart({ data }: { data: { label: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const colors = ["#10b981", "#f59e0b", "#ef4444"];
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-400">0</span>
        </div>
      </div>
    );
  }

  let cumulativeOffset = 0;
  const segments = data.map((d, i) => {
    const percentage = d.count / total;
    const offset = cumulativeOffset;
    cumulativeOffset += percentage * circumference;
    return { ...d, percentage, offset, color: colors[i % colors.length] };
  });

  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${seg.percentage * circumference} ${circumference}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{total}</span>
      </div>
    </div>
  );
}
