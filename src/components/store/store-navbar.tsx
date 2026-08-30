"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Truck, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { defaultBrandConfig } from "@/lib/brand-config";

export function StoreNavbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold shadow-sm">
            {defaultBrandConfig.appName.charAt(0)}
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-gray-900">
              {defaultBrandConfig.appName}
            </span>
            <span className="hidden text-xs text-gray-500 sm:inline ml-2 border-l pl-2">
              Stationery & Gifts
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium text-gray-600">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 transition hover:text-purple-600 ${
              pathname === "/" ? "font-semibold text-purple-600 bg-purple-50" : ""
            }`}
          >
            Store
          </Link>
          <Link
            href="/track-order"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition hover:text-purple-600 ${
              pathname === "/track-order"
                ? "font-semibold text-purple-600 bg-purple-50"
                : ""
            }`}
          >
            <Truck size={16} />
            <span className="hidden sm:inline">Track Order</span>
          </Link>
        </nav>

        {/* Right actions (Cart & Admin Portal) */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-xl bg-purple-50 px-3.5 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-[11px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <LayoutDashboard size={15} />
            Admin Panel
          </Link>
        </div>
      </div>
    </header>
  );
}
