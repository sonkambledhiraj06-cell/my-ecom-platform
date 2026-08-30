"use client";

import { CheckCircle, Clock, Package, Truck } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  amount: number;
  payment_status: string;
  status: string;
  source: string | null;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  received: <Clock size={20} className="text-blue-500" />,
  processing: <Package size={20} className="text-purple-500" />,
  shipped: <Truck size={20} className="text-orange-500" />,
  delivered: <CheckCircle size={20} className="text-green-500" />,
  returned: <Package size={20} className="text-red-500" />,
};

const statusColors: Record<string, string> = {
  received: "bg-blue-500",
  processing: "bg-purple-500",
  shipped: "bg-orange-500",
  delivered: "bg-green-500",
  returned: "bg-red-500",
};

const statusSteps = ["received", "processing", "shipped", "delivered"];

export function OrderTracker({ order }: { order: Order }) {
  const currentStatusIndex = statusSteps.indexOf(order.status) >= 0
    ? statusSteps.indexOf(order.status)
    : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order #{order.order_number}</h2>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <span className="text-lg font-bold text-gray-900">
          ₹{order.amount.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Order Status</p>
        <div className="flex items-center">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full ${
                      isCompleted ? statusColors[step] : "bg-gray-200"
                    } text-white`}
                  >
                    {statusIcons[step] || <Clock size={20} />}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 ${
                        isCompleted ? "bg-purple-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <p className={`mt-1 text-xs font-medium capitalize ${
                  isCurrent ? "text-purple-700" : "text-gray-500"
                }`}>
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {(order.tracking_number || order.carrier) && (
        <div className="border-t pt-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Tracking Information</p>
          {order.carrier && (
            <p className="text-sm text-gray-600">Carrier: {order.carrier}</p>
          )}
          {order.tracking_number && (
            <p className="text-sm text-gray-600">Tracking #: {order.tracking_number}</p>
          )}
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:underline"
            >
              Track on carrier's website
            </a>
          )}
        </div>
      )}

      <div className="border-t pt-4 text-sm">
        <p className="text-gray-500">
          Delivering to: {order.customer_name}
          {order.customer_phone && ` | ${order.customer_phone}`}
        </p>
        <p className="text-gray-500 mt-1">Payment: {order.payment_status}</p>
        {order.source && (
          <p className="text-gray-500 mt-1">Source: {order.source}</p>
        )}
      </div>
    </div>
  );
}

export type { Order };
