"use client";

import { useState, useEffect } from "react";

type ReportModalProps = {
  contentId: number;
};

const REPORT_REASONS = [
  "Broken link",
  "Inappropriate content",
  "Copyright violation",
  "Spam",
  "Outdated information",
  "Other",
];

export function ReportModal({ contentId }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleOpenModal(e: Event) {
      const customEvent = e as CustomEvent<{ contentId: number }>;
      if (customEvent.detail.contentId === contentId) {
        setIsOpen(true);
      }
    }

    window.addEventListener("openReportModal", handleOpenModal);
    return () => window.removeEventListener("openReportModal", handleOpenModal);
  }, [contentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/public/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, reason, details }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setIsOpen(false);
    setReason("");
    setDetails("");
    setSubmitted(false);
    setError(null);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl max-w-md w-full p-6 shadow-xl">
        {submitted ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Report Submitted
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Thank you for your report. We will review it shortly.
            </p>
            <button
              onClick={closeModal}
              className="btn-primary text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Report Content
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Reason for reporting
                </label>
                <select
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 text-sm text-zinc-900 dark:text-white"
                >
                  <option value="">Select a reason...</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-white resize-none"
                  placeholder="Please provide any additional information..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !reason}
                  className="flex-1 h-10 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
