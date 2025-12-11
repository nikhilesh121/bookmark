"use client";

import { useState, useEffect } from "react";

type ContentReport = {
  id: number;
  contentId: number;
  reason: string;
  details: string | null;
  reporterIp: string | null;
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  content: {
    id: number;
    title: string;
    slug: string;
    type: string;
  };
};

const STATUSES = ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"] as const;

export function ReportsPageClient() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/reports");
        if (!res.ok) throw new Error("Failed to load reports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function updateStatus(report: ContentReport, newStatus: ContentReport["status"]) {
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(report: ContentReport) {
    if (!confirm("Delete this report?")) return;

    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete report");

      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const filteredReports = filterStatus
    ? reports.filter((r) => r.status === filterStatus)
    : reports;

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Content Reports
          {pendingCount > 0 && (
            <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-sm">
              {pendingCount} pending
            </span>
          )}
        </h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/50 border border-red-700 p-4 text-red-200">
          {error}
        </div>
      )}

      {filteredReports.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-8 text-center text-zinc-400">
          No reports found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <a
                    href={`/content/${report.content.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-400 hover:underline"
                  >
                    {report.content.title}
                  </a>
                  <span className="ml-2 text-xs text-zinc-500">
                    ({report.content.type})
                  </span>
                </div>
                <select
                  value={report.status}
                  onChange={(e) => updateStatus(report, e.target.value as ContentReport["status"])}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    report.status === "PENDING"
                      ? "bg-yellow-900/50 text-yellow-300"
                      : report.status === "REVIEWED"
                      ? "bg-blue-900/50 text-blue-300"
                      : report.status === "RESOLVED"
                      ? "bg-green-900/50 text-green-300"
                      : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium text-zinc-200">Reason: {report.reason}</p>
                {report.details && (
                  <p className="mt-1 text-sm text-zinc-400">{report.details}</p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  Reported: {new Date(report.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(report)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
