"use client";

import { Package, ArrowLeft, ShoppingBag, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { numberValue } from "@/components/store/product-card";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  selling_price: number | string | null;
  stock_level: number | string | null;
  category: string | null;
  image_url: string | null;
}

interface ProductDetailProps {
  product: Product;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
  added: boolean;
}

export function ProductDetail({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  added,
}: ProductDetailProps) {
  const router = useRouter();
  const price = numberValue(product.selling_price);
  const stock = numberValue(product.stock_level);

  return (
    <>
      <button
        onClick={() => router.push("/products")}
        className="mb-6 flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600"
      >
        <ArrowLeft size={16} />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Product Image */}
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={400}
              height={400}
              className="h-full w-full object-contain"
            />
          ) : (
            <Package size={80} className="text-gray-300" />
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              {product.category ?? "General"}
            </span>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-1 text-sm text-gray-500 font-mono">{product.sku}</p>
          </div>

          <p className="text-3xl font-bold text-gray-900">₹{price.toLocaleString("en-IN")}</p>

          <p className="text-sm text-gray-600">
            {product.description ?? "Premium quality product from AiD Stationery & Gifts."}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <label className="text-sm font-medium text-gray-700">Qty:</label>
            <select
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-purple-500"
              disabled={stock <= 0}
            >
              {Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${stock > 0 ? "text-green-600" : "text-red-600"}`}>
              {stock > 0 ? `${stock} units in stock` : "Out of stock"}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={stock <= 0}
            className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white shadow-lg transition ${
              stock > 0 ? "bg-purple-600 hover:bg-purple-700" : "cursor-not-allowed bg-gray-400"
            }`}
          >
            {added ? <Check size={20} /> : <ShoppingBag size={20} />}
            {stock > 0 ? (added ? "Added!" : "Add to Cart") : "Out of Stock"}
          </button>

          <button
            onClick={() => router.push("/cart")}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-purple-600 px-6 py-3 text-base font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Go to Cart
          </button>
        </div>
      </div>
    </>
  );
}
