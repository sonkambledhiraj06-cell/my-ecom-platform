"use client";

import { ReactNode } from "react";
import { StoreNavbar } from "@/components/store/store-navbar";

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreNavbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 bg-white py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} AiD Stationery & Gifts. All rights reserved.
        </div>
      </footer>
    </>
  );
}
