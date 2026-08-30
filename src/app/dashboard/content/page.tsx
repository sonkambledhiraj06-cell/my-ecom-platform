export const dynamic = "force-dynamic";

import { Sparkles, Video, Wand2, FileText, Image, MessageSquare, AlertTriangle } from "lucide-react";

export default function ContentVideoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-pink-600" size={22} />
          AI Content & Video
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Generate marketing content and videos powered by AI.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">API Configuration Required</p>
          <p className="text-xs text-amber-700 mt-0.5">
            To enable AI content and video generation, add your OpenAI API key to the environment variables.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wand2 size={16} className="text-purple-500" /> AI Content Generation
          </h3>
          <div className="space-y-3">
            <ContentOption
              icon={<FileText size={16} className="text-blue-500" />}
              title="Product Description"
              description="SEO-optimized, compelling product descriptions"
            />
            <ContentOption
              icon={<MessageSquare size={16} className="text-pink-500" />}
              title="Social Media Captions"
              description="Platform-specific captions for Instagram, Facebook, Twitter"
            />
            <ContentOption
              icon={<FileText size={16} className="text-emerald-500" />}
              title="Benefits & USP"
              description="Auto-generated benefits and unique selling propositions"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Video size={16} className="text-red-500" /> AI Video Generation
          </h3>
          <div className="space-y-3">
            <VideoOption format="AI Recommended" desc="Let AI choose the best style for your product" />
            <VideoOption format="Product Showcase" desc="Professional product highlight video" />
            <VideoOption format="Problem → Solution" desc="Show how your product solves customer pain points" />
            <VideoOption format="Lifestyle" desc="Product in real-life usage context" />
            <VideoOption format="UGC Style" desc="Authentic user-generated content style" />
            <VideoOption format="Premium" desc="High-end cinematic product video" />
            <VideoOption format="Offer / Sales" desc="Promotional video highlighting deals" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Aspect Ratios</p>
            <div className="flex gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">9:16</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">1:1</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">16:9</span>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-3 mb-2">Durations</p>
            <div className="flex gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">10 sec</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">15 sec</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">30 sec</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Video Status Tracking</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatusCard status="Queued" count={0} color="bg-gray-100 text-gray-600" />
          <StatusCard status="Processing" count={0} color="bg-blue-50 text-blue-700" />
          <StatusCard status="Completed" count={0} color="bg-emerald-50 text-emerald-700" />
          <StatusCard status="Failed" count={0} color="bg-red-50 text-red-700" />
        </div>
      </div>
    </div>
  );
}

function ContentOption({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-left hover:border-purple-200 hover:bg-purple-50/50 transition"
      onClick={() => alert(`${title} generation requires OpenAI API key configuration.`)}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </button>
  );
}

function VideoOption({ format, desc }: { format: string; desc: string }) {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-left hover:border-pink-200 hover:bg-pink-50/50 transition"
      onClick={() => alert(`Video generation requires video provider API key (e.g., fal.ai, Runway, or similar).`)}
    >
      <Video size={14} className="text-pink-500 shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-900">{format}</p>
        <p className="text-[10px] text-gray-500">{desc}</p>
      </div>
    </button>
  );
}

function StatusCard({ status, count, color }: { status: string; count: number; color: string }) {
  return (
    <div className={`rounded-lg p-3 text-center ${color}`}>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-xs font-medium">{status}</p>
    </div>
  );
}
