"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AddProductModalProps {
  onClose: () => void;
  onProductAdded?: () => void;
  product?: {
    id: string;
    name: string;
    sku: string;
    category: string | null;
    price?: number | string | null;
    cogs?: number | string | null;
    stock?: number | string | null;
    selling_price?: number | string | null;
    cost_cogs?: number | string | null;
    stock_level?: number | string | null;
    image_url?: string | null;
  };
}

export default function AddProductModal({
  onClose,
  onProductAdded,
  product,
}: AddProductModalProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product ? String(product.selling_price ?? product.price ?? "") : "");
  const [cogs, setCogs] = useState(product ? String(product.cost_cogs ?? product.cogs ?? "") : "");
  const [stock, setStock] = useState(product ? String(product.stock_level ?? product.stock ?? "") : "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const parsedPrice = Number.parseFloat(price);
      const parsedCogs = Number.parseFloat(cogs);
      const parsedStock = Number.parseInt(stock, 10);
      if (!Number.isFinite(parsedPrice) || !Number.isFinite(parsedCogs) || !Number.isFinite(parsedStock)) {
        setError("Enter valid price, COGS, and stock values.");
        return;
      }
      const productData = {
        name,
        sku,
        category: category.trim() || null,
        selling_price: parsedPrice,
        cost_cogs: parsedCogs,
        stock_level: parsedStock,
        image_url: imageUrl.trim() || null,
      };
      const { error: insertError } = product
        ? await supabase.from("products").update(productData).eq("id", product.id)
        : await supabase.from("products").insert(productData);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      onProductAdded?.();
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <section
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close add product dialog"
        >
          <X size={18} />
        </button>
        <h2 id="add-product-title" className="mb-4 text-xl font-bold text-gray-900">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="SKU (e.g. NB-001)"
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            required
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Category (e.g. Stationery)"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Selling Price (₹)"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Cost (COGS) (₹)"
            value={cogs}
            onChange={(event) => setCogs(event.target.value)}
            required
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Stock Level"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            required
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : product ? "Save Changes" : "Add Product"}
          </button>
        </form>
      </section>
    </div>
  );
}
