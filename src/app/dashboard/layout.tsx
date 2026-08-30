import type { ReactNode } from "react";
import { Bell } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { defaultBrandConfig } from "@/lib/brand-config";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <DashboardSidebar />
      <main className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-black/5 bg-white/75 px-5 py-3 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-sm font-semibold">{defaultBrandConfig.appName}</p>
            <p className="text-xs text-[#86868b]">Operations dashboard</p>
          </div>
          <button type="button" className="inline-flex size-10 items-center justify-center rounded-full border border-black/5 bg-white text-[#1d1d1f] shadow-sm" aria-label="Notifications">
            <Bell className="size-4" />
          </button>
        </header>
        <div className="p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
