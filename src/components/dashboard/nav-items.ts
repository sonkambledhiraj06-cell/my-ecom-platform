import {
  BarChart3,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Package,
  Truck,
  Sparkles,
  Video,
  Brain,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNav: NavItem[] = [
  { href: "/dashboard", label: "AI Command Center", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products & Inventory", icon: Package },
  { href: "/dashboard/orders", label: "Orders & Tracking", icon: Truck },
  { href: "/dashboard/marketing", label: "AI Marketing Engine", icon: Megaphone },
  { href: "/dashboard/content", label: "AI Content & Video", icon: Sparkles },
  { href: "/dashboard/analytics", label: "AI Analytics", icon: BarChart3 },
  { href: "/dashboard/automation", label: "Automation", icon: Zap },
  { href: "/dashboard/whatsapp", label: "WhatsApp CRM", icon: MessageCircle },
  { href: "/dashboard/ai-brain", label: "AID Brain", icon: Brain },
];
