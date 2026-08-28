import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Megaphone,
  MessageSquare,
  LineChart,
  Settings,
} from "lucide-react";
import SuperAdminButton from "@/components/dashboard/super-admin-button";
import { defaultBrandConfig } from "@/lib/brand-config";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
      <div className="flex h-screen bg-gray-100">
        <aside className="flex w-64 flex-col bg-slate-900 text-white">
          <div className="border-b border-slate-800 p-5 text-xl font-bold tracking-wider">
            {defaultBrandConfig.appName}
          </div>
          <nav className="flex-1 space-y-1 p-4" aria-label="Dashboard">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
            >
              <LayoutDashboard size={20} /> Overview
            </Link>
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
            >
              <ShoppingBag size={20} /> Products &amp; POS
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
            >
              <ShoppingCart size={20} /> Orders &amp; Tracking
            </Link>
            <Link
              href="/dashboard/ads"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
            >
              <Megaphone size={20} /> Ads Automation
            </Link>
            <Link
              href="/dashboard/whatsapp"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
            >
              <MessageSquare size={20} /> WhatsApp Support
            </Link>
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
            >
              <LineChart size={20} /> Net Profit Engine
            </Link>
          </nav>
          <div className="border-t border-slate-800 p-4">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-2 text-slate-400 transition hover:text-white"
            >
              <Settings size={18} /> Settings
            </Link>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="flex items-center justify-between border-b bg-white px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Dashboard Overview
            </h1>
            <div className="flex items-center gap-3">
              <SuperAdminButton />
            </div>
          </header>
          <div className="p-8">{children}</div>
        </main>
      </div>
    );
}
