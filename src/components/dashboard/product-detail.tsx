"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Edit, Trash2, Package, AlertTriangle, CheckCircle, Star,
  Sparkles, Video, Image, Tag, ShoppingCart, Box, DollarSign,
  TrendingUp, Wand2, Copy, MessageSquare, FileText
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Product, ProductVideo, numberValue, formatCurrency, calculateProductScore, AIProductScore } from "@/lib/product-types";

export default function DashboardProductDetail({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [videos, setVideos] = useState<ProductVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<AIProductScore | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;
      const prod = data as Product;
      setProduct(prod);
      setScore(calculateProductScore(prod));

      const { data: videoData } = await supabase
        .from("product_videos")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      setVideos((videoData ?? []) as ProductVideo[]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("product_videos").delete().eq("product_id", product.id);
      const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id);
      if (deleteError) throw deleteError;
      router.push("/dashboard/products");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to delete product");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const stock = product ? numberValue(product.stock_level) : 0;
  const lowThreshold = product ? numberValue(product.low_stock) || 5 : 5;
  const price = product ? numberValue(product.selling_price) : 0;
  const mrp = product ? numberValue(product.mrp) : 0;
  const discount = product ? numberValue(product.discount) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-red-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-500">{error ?? "Product not found"}</h3>
        <button
          onClick={() => router.push("/dashboard/products")}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard/products")}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={16} /> Back to Products
        </button>
        {product.is_demo && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
            Demo Product
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-48 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package size={48} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                    <p className="mt-1 font-mono text-sm text-gray-500">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.category && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {product.category}
                    </span>
                  )}
                  {product.brand && (
                    <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                      {product.brand}
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    product.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {product.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                {product.description && (
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">{product.description}</p>
                )}
              </div>
            </div>
          </div>

          {score && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" /> AI Product Intelligence
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ScoreRing label="Overall" score={score.overall} />
                <ScoreRing label="Content" score={score.content} />
                <ScoreRing label="Marketing" score={score.marketing} />
                <ScoreRing label="Inventory" score={score.inventory} />
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <CheckItem label="Description" checked={score.hasDescription} />
                <CheckItem label="Features" checked={score.hasFeatures} />
                <CheckItem label="Benefits" checked={score.hasBenefits} />
                <CheckItem label="USP" checked={score.hasUSP} />
                <CheckItem label="Image" checked={score.hasImage} />
                <CheckItem label="Video" checked={score.hasVideo} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" /> Features
              </h3>
              {product.features && product.features.length > 0 ? (
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="mt-0.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No features added yet</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Star size={16} className="text-amber-500" /> Benefits
              </h3>
              {product.benefits && product.benefits.length > 0 ? (
                <ul className="space-y-2">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Star size={14} className="mt-0.5 text-amber-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No benefits added yet</p>
              )}
            </div>
          </div>

          {product.usp && (
            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-6">
              <h3 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Wand2 size={16} /> Unique Selling Proposition
              </h3>
              <p className="text-sm text-purple-800 leading-relaxed">{product.usp}</p>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Video size={16} className="text-pink-500" /> AI Video
            </h3>
            {videos.length > 0 ? (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                    <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      video.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                      video.status === "failed" ? "bg-red-50 text-red-700" :
                      video.status === "processing" ? "bg-blue-50 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {video.status}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic mb-3">No videos generated yet</p>
            )}
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-pink-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-pink-700"
              onClick={() => alert("AI Video generation requires API configuration. Please add your video provider API key.")}
            >
              <Video size={14} /> Generate Video
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" /> Pricing
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Selling Price</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(price)}</span>
              </div>
              {mrp > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">MRP</span>
                  <span className="text-sm text-gray-500 line-through">{formatCurrency(mrp)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Discount</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {discount}% OFF
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Box size={16} className="text-blue-500" /> Inventory
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Stock</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  stock <= 0 ? "bg-red-100 text-red-700" :
                  stock <= lowThreshold ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700"
                }`}>
                  {stock <= 0 ? "Out of Stock" : stock <= lowThreshold ? `${stock} Low` : `${stock} In Stock`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Low Stock Alert</span>
                <span className="text-xs text-gray-600">Below {lowThreshold}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-500" /> Marketing
            </h3>
            <div className="space-y-2">
              <ActionButton icon={<Copy size={14} />} label="Generate Ad Copy" />
              <ActionButton icon={<MessageSquare size={14} />} label="Generate Caption" />
              <ActionButton icon={<Wand2 size={14} />} label="Generate USP" />
              <ActionButton icon={<Sparkles size={14} />} label="Generate Benefits" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button
                type="button"
                className="w-full inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
              >
                <Edit size={14} /> Edit Product
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-600 mb-1">{product.name}</p>
            <p className="text-xs text-gray-500 mb-4">SKU: {product.sku}</p>
            <p className="text-sm text-red-600 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ label, score }: { label: string; score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : score >= 25 ? "#f97316" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute translate-y-5 text-sm font-bold text-gray-900">{score}%</span>
      <span className="text-[10px] text-gray-500 mt-1">{label}</span>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {checked ? (
        <CheckCircle size={12} className="text-emerald-500" />
      ) : (
        <div className="h-3 w-3 rounded-full border border-gray-300" />
      )}
      <span className={`text-xs ${checked ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="w-full inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
      onClick={() => alert(`${label} requires OpenAI API key configuration.`)}
    >
      {icon} {label}
    </button>
  );
}
