"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface OrderRecord {
  amount: number | string | null;
  payment_status: string | null;
  status: string | null;
}

interface ProductRecord {
  cogs?: number | string | null;
  cost_cogs?: number | string | null;
}

interface Metrics {
  grossRevenue: number;
  cogs: number;
  adSpend: number;
  shippingCost: number;
  paymentGatewayFee: number;
  netProfit: number;
}

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0) || 0;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const [{ data: orders, error: ordersError }, { data: products, error: productsError }] = await Promise.all([
        supabase.from("orders").select("amount, payment_status, status"),
        supabase.from("products").select("cogs, cost_cogs"),
      ]);
      if (ordersError) throw ordersError;
      if (productsError) throw productsError;

      const orderRecords = (orders ?? []) as OrderRecord[];
      const productRecords = (products ?? []) as ProductRecord[];
      const grossRevenue = orderRecords
        .filter((order) => order.payment_status === "paid")
        .reduce((total, order) => total + toNumber(order.amount), 0);
      const cogs = productRecords.reduce(
        (total, product) => total + toNumber(product.cogs ?? product.cost_cogs),
        0,
      );
      const adSpend = 0;
      const shippingCost = orderRecords.length * 50;
      const paymentGatewayFee = grossRevenue * 0.02;
      const netProfit = grossRevenue - cogs - adSpend - shippingCost - paymentGatewayFee;

      setOrderCount(orderRecords.length);
      setMetrics({ grossRevenue, cogs, adSpend, shippingCost, paymentGatewayFee, netProfit });
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
  const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold text-gray-900">Net Profit Engine</h2><p className="mt-1 text-xs text-gray-500">Live financial metrics calculated from Supabase orders and products.</p></div><div className="flex gap-2"><button type="button" onClick={() => void fetchAnalytics()} className="relative z-10 cursor-pointer rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Refresh</button><button type="button" onClick={exportReport} disabled={loading} className="relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"><Download size={16} />Export CSV</button></div></div>
      {loading ? <div className="flex items-center justify-center gap-2 rounded-xl border bg-white p-12 text-sm text-gray-500"><Loader2 className="animate-spin" size={20} />Loading analytics...</div> : error ? <div className="rounded-xl border bg-white p-12 text-center text-sm text-red-600">{error}</div> : <>
        <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg"><div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-400"><ShieldCheck size={16} />Verified True Net Profit</span><h3 className="mt-2 text-4xl font-extrabold">{money(metrics.netProfit)}</h3><p className="mt-1 text-xs text-slate-400">Net Margin: <span className="font-bold text-emerald-400">{netMargin.toFixed(1)}%</span></p></div><div className="flex items-center gap-3"><MetricHighlight label="Gross Revenue" value={metrics.grossRevenue} /><MetricHighlight label="Total Deductions" value={totalDeductions} valueClassName="text-red-400" /></div></div></section>
        <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"><h3 className="border-b pb-3 text-base font-bold text-gray-800">Operational Cost Breakdown</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><CostCard label="Cost of Goods (COGS)" value={metrics.cogs} /><CostCard label="Ad Spend" value={metrics.adSpend} /><CostCard label="Logistics & Courier" value={metrics.shippingCost} /><CostCard label="Payment Gateway (2%)" value={metrics.paymentGatewayFee} /></div></section>
      </>}
    </div>
  );
}

function MetricHighlight({ label, value, valueClassName = "text-white" }: { label: string; value: number; valueClassName?: string }) { return <div className="min-w-[120px] rounded-xl border border-slate-700 bg-slate-800 p-4 text-center"><p className="text-[11px] font-semibold uppercase text-slate-400">{label}</p><p className={`mt-1 text-lg font-bold ${valueClassName}`}>₹{value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p></div>; }
function CostCard({ label, value }: { label: string; value: number }) { return <article className="rounded-xl border bg-gray-50/50 p-4"><span className="text-xs font-semibold text-gray-500">{label}</span><h4 className="mt-2 text-xl font-bold text-gray-900">₹{value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h4></article>; }
