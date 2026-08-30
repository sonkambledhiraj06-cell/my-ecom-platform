"use client";

import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  selling_price: number | string | null;
  stock_level: number | string | null;
  category: string | null;
  image_url: string | null;
}

const numberValue = (value: number | string | null | undefined) =>
  Number(value ?? 0) || 0;

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const price = numberValue(product.selling_price);
  const stock = numberValue(product.stock_level);

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-purple-300 hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={150}
              height={150}
              className="h-full w-full object-contain transition group-hover:scale-105"
            />
          ) : (
            <Package size={40} className="text-gray-300" />
          )}
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 line-clamp-1">
          {product.name}
        </h3>
      </Link>
      <p className="mt-1 text-xs text-gray-500 line-clamp-2 h-10">
        {product.description ?? "Premium quality product"}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">
          ₹{price.toLocaleString("en-IN")}
        </span>
        <span className="text-xs text-gray-500">{stock} in stock</span>
      </div>
      <button
        onClick={onAddToCart}
        className="mt-3 w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
      >
        Add to Cart
      </button>
    </div>
  );
}

export { numberValue };
