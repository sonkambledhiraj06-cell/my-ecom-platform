"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Package,
  Search,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PosProduct {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  selling_price?: number | string | null;
  price?: number | string | null;
  cost_cogs?: number | string | null;
  cogs?: number | string | null;
  stock_level?: number | string | null;
  stock?: number | string | null;
  low_stock?: number | string | null;
}

interface ManualPosEntryModalProps {
  onClose: () => void;
  onStockUpdated?: () => void;
  initialProduct?: PosProduct | null;
}

const productPrice = (product: PosProduct) =>
  Number(product.selling_price ?? product.price ?? 0);
const productStock = (product: PosProduct) =>
  Number(product.stock_level ?? product.stock ?? 0);
const productLowStock = (product: PosProduct) =>
  Number(product.low_stock ?? 5);

export default function ManualPosEntryModal({
  onClose,
  onStockUpdated,
  initialProduct,
}: ManualPosEntryModalProps) {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<PosProduct | null>(
    initialProduct ?? null,
  );
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [posError, setPosError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, sku, category, selling_price, price, cost_cogs, cogs, stock_level, stock, low_stock",
          )
          .order("name", { ascending: true });

        if (!isMounted) return;

        if (error) {
          setLoadError(error.message);
        } else {
          setProducts((data ?? []) as PosProduct[]);
        }
      } catch (caughtError) {
        if (isMounted) {
          setLoadError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load products",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.sku, product.category ?? ""].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [products, searchQuery]);

  const currentStock = selectedProduct ? productStock(selectedProduct) : 0;
  const parsedQuantity = Number.parseInt(quantity, 10);
  const projectedStock = selectedProduct ? currentStock - (parsedQuantity || 0) : 0;
  const isLowStock =
    selectedProduct !== null && projectedStock <= productLowStock(selectedProduct);

  const handleDeductStock = async () => {
    if (!selectedProduct) return;

    setPosError(null);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      setPosError("Enter a valid quantity of at least 1.");
      return;
    }
    if (parsedQuantity > currentStock) {
      setPosError(`Only ${currentStock} unit${currentStock === 1 ? "" : "s"} in stock.`);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .update({ stock_level: projectedStock })
        .eq("id", selectedProduct.id);

      if (error) {
        setPosError(error.message);
        return;
      }

      setSuccessMessage(
        `Sold ${parsedQuantity} × ${selectedProduct.name}. ${projectedStock} unit${projectedStock === 1 ? "" : "s"} left.`,
      );
      onStockUpdated?.();
    } catch (caughtError) {
      setPosError(
        caughtError instanceof Error ? caughtError.message : "Unable to update stock",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pos-entry-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close manual POS entry"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
            <Package size={20} />
          </div>
          <div>
            <h2 id="pos-entry-title" className="text-xl font-bold text-gray-900">
              Manual POS Entry
            </h2>
            <p className="text-xs text-gray-500">
              Deduct stock instantly for offline shop sales.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            <Loader2 className="animate-spin" size={20} /> Loading products...
          </div>
        ) : loadError ? (
          <div className="py-10 text-center text-sm text-red-600">
            Unable to load products: {loadError}
          </div>
        ) : successMessage ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="text-emerald-600" size={40} />
            <p className="text-sm font-medium text-gray-900">{successMessage}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto">
            {!selectedProduct ? (
              <>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={16}
                    aria-hidden
                  />
                  <input
                    type="text"
                    placeholder="Search by name, SKU, or category..."
                    aria-label="Search products for POS"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    autoFocus
                    className="w-full rounded-lg border py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-100">
                  {filteredProducts.length === 0 ? (
                    <li className="p-6 text-center text-sm text-gray-500">
                      No products match your search.
                    </li>
                  ) : (
                    filteredProducts.map((product) => {
                      const stock = productStock(product);
                      const lowStock = productLowStock(product);

                      return (
                        <li key={product.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProduct(product);
                              setQuantity("1");
                              setPosError(null);
                            }}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-gray-900">
                                {product.name}
                              </span>
                              <span className="block font-mono text-xs text-gray-400">
                                {product.category ? `${product.category} · ` : ""}
                                {product.sku}
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                ₹{productPrice(product)}
                              </span>
                              <span
                                className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                                  stock <= lowStock
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {stock} left
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {selectedProduct.name}
                      </p>
                      <p className="font-mono text-xs text-gray-400">
                        {selectedProduct.category ? `${selectedProduct.category} · ` : ""}
                        {selectedProduct.sku}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setSearchQuery("");
                        setQuantity("1");
                        setPosError(null);
                      }}
                      className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[11px] uppercase text-gray-500">Price</p>
                      <p className="text-sm font-bold text-gray-900">
                        ₹{productPrice(selectedProduct)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase text-gray-500">In Stock</p>
                      <p className="text-sm font-bold text-gray-900">{currentStock}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase text-gray-500">After Sale</p>
                      <p
                        className={`text-sm font-bold ${
                          isLowStock ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        {projectedStock}
                      </p>
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">
                    Quantity to deduct
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={currentStock}
                    step="1"
                    value={quantity}
                    onChange={(event) => {
                      setQuantity(event.target.value);
                      setPosError(null);
                    }}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </label>

                {isLowStock && projectedStock < currentStock && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <AlertTriangle size={14} />
                    This will bring stock to {projectedStock}, which is at or below the
                    low-stock threshold ({productLowStock(selectedProduct)}).
                  </div>
                )}

                {posError && <p className="text-sm text-red-600">{posError}</p>}

                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Sale total:{" "}
                    <span className="font-bold text-gray-900">
                      ₹{productPrice(selectedProduct) * (parsedQuantity || 0)}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleDeductStock()}
                    disabled={submitting || !selectedProduct}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting && <Loader2 className="animate-spin" size={16} />}
                    <Package size={16} />
                    Deduct Stock
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
