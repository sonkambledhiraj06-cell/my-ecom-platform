"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Package } from "lucide-react";
import { StoreNavbar } from "@/components/store/store-navbar";
import { ProductDetail } from "@/components/store/product-detail-view";
import { useCart } from "@/context/cart-context";
import { createClient } from "@/lib/supabase/client";
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

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("id, name, sku, description, selling_price, stock_level, category, image_url")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;
      setProduct((data ?? null) as Product | null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!product || numberValue(product.stock_level) < quantity) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: numberValue(product.selling_price),
        image_url: product.image_url ?? undefined,
        category: product.category ?? undefined,
        sku: product.sku ?? undefined,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const stock = product ? numberValue(product.stock_level) : 0;

  return (
    <>
      <StoreNavbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Package size={40} className="text-gray-300 animate-bounce" />
          </div>
        ) : error || !product ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">
              {error ?? "Product not found"}
            </h3>
            <button
              onClick={() => window.location.assign("/products")}
              className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Back to Products
            </button>
          </div>
        ) : (
          <ProductDetail
            product={product}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            added={added}
          />
        )}
      </div>
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} AiD Stationery & Gifts. All rights reserved.
        </div>
      </footer>
    </>
  );
}
