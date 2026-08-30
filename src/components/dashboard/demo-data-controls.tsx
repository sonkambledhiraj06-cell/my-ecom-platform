"use client";

import { useState } from "react";
import { Database, Trash2, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { addDemoProducts, deleteAllDemoProducts, getDemoProductCount } from "@/lib/demo-data";

export function DemoDataControls() {
  const [loading, setLoading] = useState(false);
  const [demoCount, setDemoCount] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const refreshCount = async () => {
    const count = await getDemoProductCount();
    setDemoCount(count);
  };

  const handleAddDemo = async () => {
    setLoading(true);
    setMessage(null);
    const result = await addDemoProducts();
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: `Added ${result.count} demo products successfully.` });
      setDemoCount(result.count);
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to add demo products." });
    }
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    setMessage(null);
    setShowDeleteConfirm(false);
    const result = await deleteAllDemoProducts();
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: `Deleted ${result.count} demo products.` });
      setDemoCount(0);
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to delete demo products." });
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-amber-100 p-2">
          <Database size={20} className="text-amber-700" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900">Demo Data</h3>
          <p className="text-xs text-amber-700 mt-0.5">
            {demoCount !== null
              ? `${demoCount} demo products in database`
              : "Test the dashboard with sample data"}
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 flex items-start gap-2 rounded-lg p-3 text-xs ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={14} className="mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleAddDemo}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
          Add Demo Products
        </button>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 size={14} />
          Delete All Demo Products
        </button>

        <button
          type="button"
          onClick={refreshCount}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
        >
          Check Count
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Demo Products?</h3>
            <p className="text-sm text-gray-600 mb-1">
              This will permanently remove all demo products and their associated demo assets.
            </p>
            <p className="text-xs text-gray-500 mb-5">
              Real products will not be affected.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Demo Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
