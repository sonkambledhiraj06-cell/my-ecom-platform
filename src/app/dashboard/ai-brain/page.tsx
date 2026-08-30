"use client";

import { useState } from "react";
import { Brain, Send, Sparkles, Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Which product is performing best?",
  "Which products need videos?",
  "Why are sales down?",
  "Which products have low stock?",
  "Which products should I advertise?",
  "What should I do today?",
];

export default function AIDBrainPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm AID, your AI Business Assistant. I can help you understand your products, inventory, orders, customers, sales, and marketing data. Ask me anything about your business!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    setTimeout(() => {
      const response = generateResponse(userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, 500);
  };

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes("performing best") || q.includes("best product") || q.includes("top product")) {
      return "Based on available data, I need access to your sales and order data to determine the best performing product. I can analyze product metrics like inventory turnover, pricing, and content readiness once you have orders in the system.\n\nTo get accurate performance insights, make sure you have:\n• Orders linked to products\n• Stock level tracking enabled\n• Pricing and COGS data populated\n\nWould you like me to check which products are low on stock or need content improvements in the meantime?";
    }

    if (q.includes("video") || q.includes("need video")) {
      return "Currently, I can check your product catalog for video readiness. Each product needs an associated marketing video for optimal ad performance.\n\nTo check video status:\n1. Add demo products to test the system\n2. Navigate to Products & Inventory\n3. Check the AI Product Intelligence score\n\nNote: Actual AI video generation requires configuring a video provider API (like fal.ai, Runway, or similar).";
    }

    if (q.includes("sales down") || q.includes("why") || q.includes("sales")) {
      return "I'd need access to your historical sales data to diagnose sales trends. I can analyze:\n\n• Order volume over time\n• Product performance comparisons\n• Seasonal trends\n• Ad spend vs revenue correlation\n\nCurrently, I don't have enough order data to provide specific insights. Start by adding products and tracking orders through the system.";
    }

    if (q.includes("low stock") || q.includes("stock") || q.includes("restock")) {
      return "I can help monitor your inventory levels! Each product has a low stock threshold that triggers alerts.\n\nTo check stock status:\n1. Visit Products & Inventory\n2. Products marked with amber indicators are low on stock\n3. Red indicators mean out of stock\n\nThe automation engine can be configured to alert you when stock falls below threshold.";
    }

    if (q.includes("advertise") || q.includes("ad") || q.includes("marketing")) {
      return "For advertising recommendations, I consider:\n\n• Products with high AI content score (complete descriptions, images, videos)\n• Products with healthy stock levels\n• Products with good profit margins\n\nProducts with complete marketing content will perform better in ads. Focus on:\n1. Products with AI score > 75%\n2. Products with active status and good stock\n3. Products with USP and benefits defined";
    }

    if (q.includes("what should i do") || q.includes("improve") || q.includes("recommend")) {
      return "Here's my general recommendation for your business:\n\n1. **Complete Product Data** — Ensure all products have descriptions, features, benefits, and USPs\n2. **Add Images** — Products with images convert 40% better\n3. **Generate Marketing Content** — Use AI to create ad copies and social captions\n4. **Monitor Stock** — Set up low-stock alerts to avoid stockouts\n5. **Track Orders** — Link orders to products for sales analytics\n\nStart by adding demo products to explore all features!";
    }

    return "I can help you with:\n\n• **Products** — Catalog management, scoring, content readiness\n• **Inventory** — Stock levels, low-stock alerts, restock recommendations\n• **Orders** • Sales tracking, customer insights\n• **Marketing** • Ad copy, social captions, video scripts\n• **Finance** • Profit margins, revenue analytics\n\nWhat specific aspect of your business would you like to explore?";
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="text-purple-600" size={22} />
          AID Brain
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Your AI business assistant. Ask questions about your data.
        </p>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {message.role === "assistant" && (
                  <Sparkles size={14} className="inline mr-1.5 text-purple-500" />
                )}
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInput(q)}
                className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 transition"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask AID about your business..."
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
