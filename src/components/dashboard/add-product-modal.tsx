"use client";

import { FormEvent, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AddProductModalProps {
  onClose: () => void;
  onProductAdded?: () => void;
  product?: {
    id: string;
    name: string;
    sku: string;
    category: string | null;
    brand?: string | null;
    description?: string | null;
    price?: number | string | null;
    cogs?: number | string | null;
    stock?: number | string | null;
    selling_price?: number | string | null;
    cost_cogs?: number | string | null;
    stock_level?: number | string | null;
    low_stock?: number | string | null;
    image_url?: string | null;
    mrp?: number | string | null;
    discount?: number | string | null;
    features?: string[] | null;
    benefits?: string[] | null;
    usp?: string | null;
    status?: string | null;
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
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.selling_price ?? product.price ?? "") : "");
  const [mrp, setMrp] = useState(product ? String(product.mrp ?? "") : "");
  const [cogs, setCogs] = useState(product ? String(product.cost_cogs ?? product.cogs ?? "") : "");
  const [stock, setStock] = useState(product ? String(product.stock_level ?? product.stock ?? "") : "");
  const [lowStock, setLowStock] = useState(product ? String(product.low_stock ?? "5") : "5");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [usp, setUsp] = useState(product?.usp ?? "");
  const [features, setFeatures] = useState<string[]>(product?.features ?? []);
  const [benefits, setBenefits] = useState<string[]>(product?.benefits ?? []);
  const [newFeature, setNewFeature] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [status, setStatus] = useState(product?.status ?? "active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const parsedPrice = Number.parseFloat(price);
      const parsedMrp = Number.parseFloat(mrp) || 0;
      const parsedCogs = Number.parseFloat(cogs);
      const parsedStock = Number.parseInt(stock, 10);
      const parsedLowStock = Number.parseInt(lowStock, 10) || 5;

      if (!Number.isFinite(parsedPrice) || !Number.isFinite(parsedCogs) || !Number.isFinite(parsedStock)) {
        setError("Enter valid price, COGS, and stock values.");
        return;
      }

      const calculatedDiscount = parsedMrp > 0 ? Number((((parsedMrp - parsedPrice) / parsedMrp) * 100).toFixed(2)) : 0;

      const productData = {
        name,
        sku,
        category: category.trim() || null,
        brand: brand.trim() || null,
        description: description.trim() || null,
        selling_price: parsedPrice,
        mrp: parsedMrp,
        discount: calculatedDiscount,
        cost_cogs: parsedCogs,
        stock_level: parsedStock,
        low_stock: parsedLowStock,
        image_url: imageUrl.trim() || null,
        usp: usp.trim() || null,
        features,
        benefits,
        status,
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
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
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
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Product Name *"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="SKU *"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              required
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500 resize-none"
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Selling Price (₹) *"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="MRP (₹)"
              value={mrp}
              onChange={(event) => setMrp(event.target.value)}
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Cost (COGS) (₹) *"
              value={cogs}
              onChange={(event) => setCogs(event.target.value)}
              required
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Stock Level *"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Low Stock Threshold"
              value={lowStock}
              onChange={(event) => setLowStock(event.target.value)}
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <input
            type="url"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500"
          />

          <textarea
            placeholder="Unique Selling Proposition (USP)"
            value={usp}
            onChange={(event) => setUsp(event.target.value)}
            rows={2}
            className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500 resize-none"
          />

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a feature"
                value={newFeature}
                onChange={(event) => setNewFeature(event.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                className="flex-1 rounded-md border p-2 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addFeature}
                className="rounded-md bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200"
              >
                <Plus size={16} />
              </button>
            </div>
            <ul className="space-y-1">
              {features.map((f, i) => (
                <li key={i} className="flex items-center justify-between rounded bg-blue-50 px-2 py-1 text-xs text-blue-800">
                  <span>{f}</span>
                  <button type="button" onClick={() => removeFeature(i)} className="text-blue-500 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Benefits</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a benefit"
                value={newBenefit}
                onChange={(event) => setNewBenefit(event.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }}
                className="flex-1 rounded-md border p-2 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="rounded-md bg-purple-100 px-3 py-2 text-purple-700 hover:bg-purple-200"
              >
                <Plus size={16} />
              </button>
            </div>
            <ul className="space-y-1">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center justify-between rounded bg-purple-50 px-2 py-1 text-xs text-purple-800">
                  <span>{b}</span>
                  <button type="button" onClick={() => removeBenefit(i)} className="text-purple-500 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

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
