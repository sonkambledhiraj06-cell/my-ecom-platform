"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Package, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";
import AddProductModal from "@/components/dashboard/add-product-modal";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  selling_price?: number | string | null;
  cost_cogs?: number | string | null;
  stock_level?: number | string | null;
  price?: number | string | null;
  cogs?: number | string | null;
  stock?: number | string | null;
  low_stock?: number | string | null;
}

const productPrice = (product: Product) => Number(product.selling_price ?? product.price ?? 0);
const productCogs = (product: Product) => Number(product.cost_cogs ?? product.cogs ?? 0);
const productStock = (product: Product) => Number(product.stock_level ?? product.stock ?? 0);
const productLowStock = (product: Product) => Number(product.low_stock ?? 5);

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, count, error: supabaseError } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (supabaseError) {
        console.error("Supabase Error:", supabaseError.message);
        setError(supabaseError.message);
      } else {
        setProducts((data ?? []) as Product[]);
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
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${product?.name ?? "this product"}?`,
    );

    if (!confirmDelete) return;

    setDeletingProductId(id);
    try {
      const productClient = createClient();
      const { error: deleteError } = await productClient
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products &amp; Inventory</h2>
          <p className="mt-1 text-xs text-gray-500">
            Live database records from Supabase, COGS tracking, and low stock alerts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} /> Add New Product
        </button>
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
          value={`${products.filter((product) => productStock(product) <= productLowStock(product)).length} Item`}
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
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">Selling Price</th>
                <th className="px-5 py-3.5">Cost (COGS)</th>
                <th className="px-5 py-3.5">Gross Profit</th>
                <th className="px-5 py-3.5">Stock Level</th>
                <th className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((item) => {
                const price = productPrice(item);
                const cogs = productCogs(item);
                const stock = productStock(item);
                const profit = price - cogs;
                const isLowStock = stock <= productLowStock(item);

                return (
                  <tr key={item.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {item.name}
                      <span className="block font-mono text-xs font-normal text-gray-400">
                        SKU: {item.sku}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">₹{price}</td>
                    <td className="px-5 py-4 text-gray-600">₹{cogs}</td>
                    <td className="px-5 py-4 font-medium text-emerald-600">+₹{profit}</td>
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
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(item)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteProduct(item.id)}
                          disabled={deletingProductId === item.id}
                          className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deletingProductId === item.id ? "Deleting..." : "Delete"}
                        </button>
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
