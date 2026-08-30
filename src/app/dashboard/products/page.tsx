"use client";

export const dynamic = "force-dynamic";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle, Loader2, Package, Plus, Search, ShoppingCart, Trash2, Upload,
  MoreVertical, Edit, Copy, Sparkles, Video, Eye
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AddProductModal from "@/components/dashboard/add-product-modal";
import ManualPosEntryModal from "@/components/dashboard/manual-pos-entry-modal";
import BulkImportModal from "@/components/dashboard/bulk-import-modal";
import { Product, numberValue, formatCurrency } from "@/lib/product-types";

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  brand?: string | null;
  description?: string | null;
  selling_price?: number | string | null;
  cost_cogs?: number | string | null;
  stock_level?: number | string | null;
  low_stock?: number | string | null;
  price?: number | string | null;
  cogs?: number | string | null;
  stock?: number | string | null;
  image_url?: string | null;
  features?: string[] | null;
  benefits?: string[] | null;
  usp?: string | null;
  status?: string | null;
  is_demo?: boolean;
  created_at?: string;
  mrp?: number | string | null;
  discount?: number | string | null;
}

const productPrice = (product: ProductRow) => Number(product.selling_price ?? product.price ?? 0);
const productCogs = (product: ProductRow) => Number(product.cost_cogs ?? product.cogs ?? 0);
const productStock = (product: ProductRow) => Number(product.stock_level ?? product.stock ?? 0);
const productLowStock = (product: ProductRow) => Number(product.low_stock ?? 5);

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [posInitialProduct, setPosInitialProduct] = useState<ProductRow | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, count, error: supabaseError } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (supabaseError) {
        console.error("Supabase Error:", supabaseError.message);
        setError(supabaseError.message);
      } else {
        setProducts((data ?? []) as ProductRow[]);
        setTotalProducts(count ?? 0);
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to fetch products";
      console.error("Supabase Error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void Promise.resolve().then(fetchProducts);
  }, [fetchProducts]);

  const handleViewAll = () => {
    setLimit(1000);
    setSearchQuery("");
    setSelectedCategory("all");
    document.getElementById("products-table")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: string) => {
    const product = products.find((item) => item.id === id);
    setDeletingProductId(id);
    setShowDeleteConfirm(null);

    try {
      const supabase = createClient();

      const { error: videoDeleteError } = await supabase
        .from("product_videos")
        .delete()
        .eq("product_id", id);

      if (videoDeleteError) {
        console.warn("Warning deleting associated videos:", videoDeleteError.message);
      }

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchProducts();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleDuplicateProduct = async (product: ProductRow) => {
    try {
      const supabase = createClient();
      const duplicateData = {
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-COPY-${Date.now().toString(36)}`,
        category: product.category,
        brand: product.brand,
        description: product.description,
        selling_price: productPrice(product),
        mrp: product.mrp,
        discount: product.discount,
        cost_cogs: productCogs(product),
        stock_level: productStock(product),
        low_stock: productLowStock(product),
        features: product.features,
        benefits: product.benefits,
        usp: product.usp,
        image_url: product.image_url,
        status: product.status,
        is_demo: false,
      };

      const { error: insertError } = await supabase.from("products").insert(duplicateData);
      if (insertError) throw insertError;
      await fetchProducts();
      setOpenMenuId(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to duplicate product");
    }
  };

  const filteredProducts = products.filter(
    (item) =>
      (selectedCategory === "all" || item.category === selectedCategory) &&
      [item.name, item.sku].some((value) =>
        value.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter((category): category is string => Boolean(category))),
  );

  const deletingProduct = showDeleteConfirm ? products.find((p) => p.id === showDeleteConfirm) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products &amp; Inventory</h2>
          <p className="mt-1 text-xs text-gray-500">
            Live database records from Supabase. AI-powered product management.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPosInitialProduct(null);
              setIsPosModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600"
          >
            <ShoppingCart size={18} /> POS Entry
          </button>
          <button
            type="button"
            onClick={() => setIsBulkImportOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-purple-500 hover:text-purple-600"
          >
            <Upload size={18} /> Import
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Products"
          value={`${totalProducts} Items`}
          icon={<Package size={22} />}
          iconClassName="bg-blue-50 text-blue-600"
          onClick={handleViewAll}
        />
        <SummaryCard
          label="Low Stock Alerts"
          value={`${products.filter((product) => productStock(product) <= productLowStock(product)).length} Items`}
          valueClassName="text-amber-600"
          icon={<AlertTriangle size={22} />}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      <section
        id="products-table"
        className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-4 border-b p-4">
          <div className="relative w-full max-w-xs">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
              aria-hidden
            />
            <input
              type="text"
              placeholder="Search products by name..."
              aria-label="Search products"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              handleViewAll();
              router.push("/dashboard/products");
            }}
            className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500">
              <Loader2 className="animate-spin" size={20} /> Loading products from Supabase...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-sm text-red-600">
              Unable to load products: {error}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((item) => {
                  const price = productPrice(item);
                  const stock = productStock(item);
                  const isLowStock = stock <= productLowStock(item);

                  return (
                    <tr key={item.id} className="transition hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package size={16} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{item.name}</span>
                            {item.is_demo && (
                              <span className="ml-2 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Demo</span>
                            )}
                            <span className="block font-mono text-xs font-normal text-gray-400">
                              SKU: {item.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {item.category ? (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {item.category}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">&mdash;</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">{formatCurrency(price)}</td>
                      <td className="px-5 py-4">
                        {isLowStock ? (
                          <span className="flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                            <AlertTriangle size={12} /> {stock} left (Low)
                          </span>
                        ) : (
                          <span className="w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            {stock} in stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === item.id && (
                            <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  router.push(`/dashboard/products/${item.id}`);
                                }}
                              >
                                <Eye size={13} /> View
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setEditingProduct(item);
                                }}
                              >
                                <Edit size={13} /> Edit
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                onClick={() => void handleDuplicateProduct(item)}
                              >
                                <Copy size={13} /> Duplicate
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  alert("AI Content generation requires OpenAI API key configuration.");
                                }}
                              >
                                <Sparkles size={13} /> Generate AI Content
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  alert("AI Video generation requires API configuration. Please add your video provider API key.");
                                }}
                              >
                                <Video size={13} /> Generate Video
                              </button>
                              <hr className="my-1 border-gray-100" />
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setShowDeleteConfirm(item.id);
                                }}
                                disabled={deletingProductId === item.id}
                              >
                                <Trash2 size={13} />
                                {deletingProductId === item.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {isModalOpen && (
        <AddProductModal
          onClose={() => setIsModalOpen(false)}
          onProductAdded={() => void fetchProducts()}
        />
      )}

      {editingProduct && (
        <AddProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductAdded={() => void fetchProducts()}
        />
      )}

      {isPosModalOpen && (
        <ManualPosEntryModal
          initialProduct={posInitialProduct}
          onClose={() => {
            setIsPosModalOpen(false);
            setPosInitialProduct(null);
          }}
          onStockUpdated={() => void fetchProducts()}
        />
      )}

      {isBulkImportOpen && (
        <BulkImportModal
          onClose={() => setIsBulkImportOpen(false)}
          onImportComplete={() => void fetchProducts()}
        />
      )}

      {showDeleteConfirm && deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-600 mb-1">{deletingProduct.name}</p>
            <p className="text-xs text-gray-500 mb-4">SKU: {deletingProduct.sku}</p>
            <p className="text-sm text-red-600 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(showDeleteConfirm)}
                disabled={deletingProductId === showDeleteConfirm}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deletingProductId === showDeleteConfirm ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClassName = "text-gray-900",
  icon,
  iconClassName,
  onClick,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  icon: React.ReactNode;
  iconClassName: string;
  onClick?: () => void;
}) {
  return (
    <article
      className={`flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm${
        onClick ? " cursor-pointer transition-all hover:border-blue-500" : ""
      }`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`rounded-lg p-3 ${iconClassName}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
        <h4 className={`text-xl font-bold ${valueClassName}`}>{value}</h4>
      </div>
    </article>
  );
}
