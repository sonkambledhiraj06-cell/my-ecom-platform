"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Upload, FileSpreadsheet, ImageIcon, Loader2, AlertTriangle } from "lucide-react";
import type { ImportJob, ImportJobItem } from "@/lib/import/types";

interface BulkImportModalProps {
  onClose: () => void;
  onImportComplete?: () => void;
}

type Stage = "idle" | "uploading" | "processing" | "completed" | "failed";

export default function BulkImportModal({ onClose, onImportComplete }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [job, setJob] = useState<ImportJob | null>(null);
  const [items, setItems] = useState<ImportJobItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ matched: 0, created: 0, failed: 0, total: 0 });
  const pollRef = useRef<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setImageFiles(selected);
  };

  const pollJob = useCallback(
    async (jobId: string) => {
      const res = await fetch(`/api/products/import/${jobId}`);
      if (!res.ok) return;
      const data = await res.json();
      setJob(data.job);
      setItems(data.items ?? []);

      const processed = data.job.processed_items ?? 0;
      const matched = data.job.matched_items ?? 0;
      const created = data.job.created_items ?? 0;
      const failed = data.job.failed_items ?? 0;

      setProgress({ matched, created, failed, total: processed });

      if (data.job.status === "completed" || data.job.status === "failed") {
        setStage(data.job.status === "completed" ? "completed" : "failed");
        if (pollRef.current) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }
        onImportComplete?.();
        return;
      }

      if (data.job.status === "queued" && stage === "uploading") {
        const triggerRes = await fetch("/api/products/import/worker/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        if (triggerRes.ok) {
          setStage("processing");
        }
      }
    },
    [onImportComplete, stage],
  );

  useEffect(() => {
    if (job?.id && (stage === "processing" || stage === "uploading")) {
      pollRef.current = window.setInterval(() => {
        void pollJob(job.id);
      }, 2000);
    }
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [job?.id, pollJob, stage]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select an Excel file");
      return;
    }

    setStage("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      for (const img of imageFiles) {
        formData.append(`image_${img.name}`, img);
      }

      const res = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      setJob({
        id: data.jobId,
        user_id: "",
        status: "queued",
        total_items: data.totalItems,
        processed_items: 0,
        matched_items: 0,
        created_items: 0,
        failed_items: 0,
        current_stage: null,
        error: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setStage("processing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStage("failed");
    }
  };

  const handleRetry = async () => {
    if (!job) return;
    setStage("processing");
    setError(null);

    try {
      const res = await fetch(`/api/products/import/${job.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Retry failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
      setStage("failed");
    }
  };

  const isProcessing = stage === "processing" || stage === "uploading";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isProcessing) onClose();
      }}
    >
      <section className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close import dialog"
        >
          <X size={18} />
        </button>

        <h2 id="import-title" className="mb-4 text-xl font-bold text-gray-900">
          Bulk Product Import
        </h2>

        {stage === "completed" && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            Import completed! Created {progress.created} products, matched {progress.matched} existing products.
            {progress.failed > 0 && (
              <span className="ml-2 text-amber-700">
                <AlertTriangle size={14} className="inline mr-1" />
                {progress.failed} failed
              </span>
            )}
          </div>
        )}

        {stage === "failed" && error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}

        {stage !== "completed" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <FileSpreadsheet size={16} className="mr-1 inline" />
                Excel File (.xlsx, .xls)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {file && <p className="mt-1 text-xs text-gray-500">{file.name}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <ImageIcon size={16} className="mr-1 inline" />
                Product Images (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={isProcessing}
                className="w-full rounded-md border p-2 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {imageFiles.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">{imageFiles.length} images selected</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  {stage === "uploading" ? "Uploading..." : "Processing..."}
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Start Import
                </>
              )}
            </button>
          </form>
        )}

        {isProcessing && job && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                Importing {progress.total} / {job.total_items} products
              </span>
              <span className="text-gray-500">{Math.round((progress.total / job.total_items) * 100)}%</span>
            </div>

            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(progress.total / job.total_items) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-lg font-bold text-emerald-700">{progress.matched}</p>
                <p className="text-emerald-600">Matched</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-lg font-bold text-blue-700">{progress.created}</p>
                <p className="text-blue-600">Created</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-lg font-bold text-red-700">{progress.failed}</p>
                <p className="text-red-600">Failed</p>
              </div>
            </div>

            {items.length > 0 && (
              <div className="max-h-60 overflow-y-auto rounded-lg border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 font-mono text-gray-600">{item.sku ?? "—"}</td>
                        <td className="px-3 py-2 text-gray-900">{item.product_name ?? "—"}</td>
                        <td className="px-3 py-2">
                          <StatusBadge status={item.status} error={item.error} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {stage === "completed" && progress.failed > 0 && (
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 w-full rounded-md border border-amber-300 bg-amber-50 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
          >
            Retry Failed Items ({progress.failed})
          </button>
        )}

        {stage === "completed" && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-md bg-gray-900 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Close
          </button>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status, error }: { status: string; error?: string | null }) {
  const styles: Record<string, string> = {
    queued: "bg-gray-100 text-gray-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    matching: "bg-purple-100 text-purple-700",
    creating: "bg-amber-100 text-amber-700",
    video: "bg-indigo-100 text-indigo-700",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
      {error && error !== "null" && <span className="ml-1 text-red-500">*</span>}
    </span>
  );
}
