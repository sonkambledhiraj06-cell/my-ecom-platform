"use client";

import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { StoreNavbar } from "@/components/store/store-navbar";
import { useCart } from "@/context/cart-context";
import { CartItemRow } from "@/components/store/cart-item-row";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalAmount, clearCart } = useCart();
  const shippingFee = 50;
  const shippingThreshold = 500;
  const isEligibleForFreeShipping = totalAmount >= shippingThreshold;
  const finalTotal = totalAmount + (isEligibleForFreeShipping ? 0 : shippingFee);

  return (
    <>
      <StoreNavbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart</h1>
        <p className="text-gray-600 mb-6">
          {totalItems === 0
            ? "Your cart is empty."
            : `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`}
        </p>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-xl font-semibold text-gray-500 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 mb-6">
              Browse our products and add items to your cart.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-purple-700"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
              <div className="flex justify-between pt-4">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <OrderSummary
              totalAmount={totalAmount}
              shippingFee={shippingFee}
              isEligibleForFreeShipping={isEligibleForFreeShipping}
              finalTotal={finalTotal}
              shippingThreshold={shippingThreshold}
            />
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-6">
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm text-purple-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
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

function OrderSummary({
  totalAmount,
  shippingFee,
  isEligibleForFreeShipping,
  finalTotal,
  shippingThreshold,
}: {
  totalAmount: number;
  shippingFee: number;
  isEligibleForFreeShipping: boolean;
  finalTotal: number;
  shippingThreshold: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₹{totalAmount.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {isEligibleForFreeShipping ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `₹${shippingFee.toLocaleString("en-IN")}`
            )}
          </span>
        </div>
        {totalAmount < shippingThreshold && (
          <p className="text-xs text-gray-500">
            Add ₹{(shippingThreshold - totalAmount).toLocaleString("en-IN")} more for free shipping!
          </p>
        )}
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
      <Link
        href="/checkout"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-purple-700"
      >
        Proceed to Checkout
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
