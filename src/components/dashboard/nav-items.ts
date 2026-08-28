import {
  BarChart3,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products & Inventory", icon: Package },
  { href: "/dashboard/orders", label: "Orders & Tracking", icon: Truck },
  { href: "/dashboard/ads", label: "Ads Automation", icon: Megaphone },
  { href: "/dashboard/whatsapp", label: "WhatsApp CRM", icon: MessageCircle },
  {
    href: "/dashboard/analytics",
    label: "Net Profit Analytics",
    icon: BarChart3,
  },
];
