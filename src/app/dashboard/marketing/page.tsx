export const dynamic = "force-dynamic";

import { Megaphone, Sparkles, MessageSquare, Wand2, Video, Copy } from "lucide-react";
import Link from "next/link";

export default function MarketingEnginePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="text-purple-600" size={22} />
          AI Marketing Engine
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Transform products into marketing campaigns with AI-powered content generation.
        </p>
      </div>

      <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
        <h3 className="text-base font-bold text-purple-900 mb-2">Product → Marketing Pipeline</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-purple-700">
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Product Info</span>
          <span>→</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">AI Understands</span>
          <span>→</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Features</span>
          <span>→</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Benefits</span>
          <span>→</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">USP</span>
          <span>→</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Ad Copy</span>
          <span>→</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Social Caption</span>
          <span>→</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Video Script</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MarketingCard
          icon={<Sparkles size={20} className="text-purple-600" />}
          title="Generate Ad Copy"
          description="AI-powered ad copy tailored to your product's unique selling points."
          note="Requires OpenAI API key"
        />
        <MarketingCard
          icon={<MessageSquare size={20} className="text-pink-600" />}
          title="Social Media Captions"
          description="Engaging captions for Instagram, Facebook, and other platforms."
          note="Requires OpenAI API key"
        />
        <MarketingCard
          icon={<Video size={20} className="text-red-600" />}
          title="Video Scripts"
          description="Professional video scripts for product showcases and ads."
          note="Requires OpenAI API key"
        />
        <MarketingCard
          icon={<Wand2 size={20} className="text-blue-600" />}
          title="USP Generator"
          description="Unique selling propositions that differentiate your product."
          note="Requires OpenAI API key"
        />
        <MarketingCard
          icon={<Copy size={20} className="text-emerald-600" />}
          title="Product Descriptions"
          description="SEO-optimized product descriptions that convert browsers to buyers."
          note="Requires OpenAI API key"
        />
        <MarketingCard
          icon={<Megaphone size={20} className="text-amber-600" />}
          title="Campaign Ideas"
          description="AI-generated campaign concepts and marketing angles."
          note="Requires OpenAI API key"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition"
          >
            <Package size={16} /> View Products
          </Link>
          <button
            type="button"
            onClick={() => alert("Bulk marketing generation requires OpenAI API key configuration.")}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 transition"
          >
            <Sparkles size={16} /> Generate All Marketing
          </button>
        </div>
      </div>
    </div>
  );
}

function MarketingCard({ icon, title, description, note }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-purple-200 hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-lg bg-gray-50 p-2">{icon}</div>
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
      </div>
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{note}</span>
    </div>
  );
}

function Package({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/>
    </svg>
  );
}
