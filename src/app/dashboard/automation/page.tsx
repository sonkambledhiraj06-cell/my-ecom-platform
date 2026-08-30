export const dynamic = "force-dynamic";

import { Zap, Package, AlertTriangle, ShoppingCart, Users, TrendingUp, Bell } from "lucide-react";

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="text-amber-500" size={22} />
          Automation Engine
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          AI-powered automations that run your business on autopilot.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Product Automation Pipeline</h3>
        <div className="space-y-3">
          <AutomationItem
            icon={<Package size={16} className="text-blue-500" />}
            title="New Product Onboarding"
            description="Auto-generate description, benefits, USP, creative, and video for new products"
            steps={["Generate Description", "Generate Benefits", "Generate USP", "Generate Creative", "Generate Video", "Prepare Ad Copy"]}
          />
          <AutomationItem
            icon={<AlertTriangle size={16} className="text-amber-500" />}
            title="Low Stock Alerts"
            description="Get notified when products fall below threshold"
            steps={["Stock < Threshold", "Alert", "Recommend Restock", "Optionally pause ads"]}
          />
          <AutomationItem
            icon={<Users size={16} className="text-purple-500" />}
            title="Customer Automation"
            description="AI-segmented customer outreach"
            steps={["Customer inactive", "AI segment", "Personalized offer", "WhatsApp/Email action"]}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Active Automations</h3>
        <div className="space-y-3">
          <AutomationRule
            title="Low Stock Alert"
            description="Alert when any product stock falls below threshold"
            enabled={true}
            trigger="stock_level < low_stock"
          />
          <AutomationRule
            title="Out of Stock - Pause Ads"
            description="Automatically pause ad campaigns for out-of-stock products"
            enabled={false}
            trigger="stock_level = 0"
          />
          <AutomationRule
            title="New Product - Generate Content"
            description="Auto-generate AI content for newly added products"
            enabled={false}
            trigger="product.created"
          />
          <AutomationRule
            title="Customer Win-Back"
            description="Send personalized offers to inactive customers"
            enabled={false}
            trigger="customer.inactive_days > 30"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">
          Safety Notice: No expensive or external actions will be executed without your confirmation.
        </p>
      </div>
    </div>
  );
}

function AutomationItem({ icon, title, description, steps }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: string[];
}) {
  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {steps.map((step, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">{step}</span>
            {i < steps.length - 1 && <span className="text-gray-400 text-xs">→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function AutomationRule({ title, description, enabled, trigger }: {
  title: string;
  description: string;
  enabled: boolean;
  trigger: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className={`h-2.5 w-2.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-gray-300"}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Trigger: {trigger}</p>
        </div>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        enabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}>
        {enabled ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
