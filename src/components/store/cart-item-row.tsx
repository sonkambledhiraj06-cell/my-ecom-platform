"use client";

import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <ShoppingBag size={32} className="text-gray-300" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500">₹{item.price.toLocaleString("en-IN")} each</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          className="rounded-lg border border-gray-300 p-1 text-gray-600 hover:bg-gray-50"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="rounded-lg border border-gray-300 p-1 text-gray-600 hover:bg-gray-50"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
        <button
          onClick={onRemove}
          className="mt-1 text-red-600 hover:text-red-700"
          aria-label={`Remove ${item.name} from cart`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
