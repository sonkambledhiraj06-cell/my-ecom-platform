"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  selling_price: number | string | null;
  price: number | string | null;
  stock_level: number | string | null;
  stock: number | string | null;
  category: string | null;
  image_url: string | null;
}

const numberValue = (value: number | string | null | undefined) =>
  Number(value ?? 0) || 0;

export default function FeaturedProducts({
  products,
  error,
}: {
  products: Product[] | null;
  error: string | null;
}) {
  const featured = products ?? [];

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:underline"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        {error ? (
          <p className="text-gray-500">Unable to load products.</p>
        ) : featured.length === 0 ? (
          <p className="text-gray-500">No products available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => {
              const price = numberValue(product.selling_price ?? product.price);
              const stock = numberValue(product.stock_level ?? product.stock);
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-purple-300 hover:shadow-lg"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="h-full w-full object-contain transition group-hover:scale-105"
                      />
                    ) : (
                      <Package size={40} className="text-gray-300" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 line-clamp-1">{product.name}</h3>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-1">{product.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">₹{price.toLocaleString("en-IN")}</span>
                    <span className={`text-xs font-medium ${stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export type { Product as FeaturedProduct };
