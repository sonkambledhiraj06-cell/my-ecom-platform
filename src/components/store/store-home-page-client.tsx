"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import { StoreNavbar } from "@/components/store/store-navbar";
import FeaturedProducts from "@/components/store/featured-products";
import { createClient } from "@/lib/supabase/client";

export function StoreHomePageClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("products")
          .select("id, name, description, selling_price, stock_level, category, image_url")
          .gt("stock_level", 0)
          .order("created_at", { ascending: false })
          .limit(8);

        if (fetchError) throw fetchError;
                setProducts((data ?? []) as any[]);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, []);

  return (
    <>
      <StoreNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              AiD Stationery & Gifts
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Premium stationery and curated gifts delivered to your doorstep.
              Quality you can trust, prices you will love.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-purple-700"
              >
                <ShoppingBag size={20} />
                Shop Now
              </Link>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-600 px-6 py-3 text-base font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                <Package size={20} />
                Track Your Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FeaturedProducts products={products} error={loading ? "Loading..." : error} />

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">Need Help?</h2>
          <p className="mt-4 text-gray-600">
            Track your order, get customer support on WhatsApp, or explore our
            full catalog.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              <Package size={20} />
              Track Order
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-600 px-6 py-3 text-base font-semibold text-purple-700 transition hover:bg-purple-50"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} AiD Stationery & Gifts. All rights reserved.
        </div>
      </footer>
    </>
  );
}
