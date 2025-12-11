"use client";

import { useEffect, useState } from "react";

type DailyEntry = {
  date: string;
  views: number;
  clicks: number;
};

type TopContentEntry = {
  id: number;
  title: string;
  slug: string;
  type: string;
  totalViews: number;
  totalClicks: number;
  ctr: number;
};

type AnalyticsOverview = {
  rangeDays: number;
  daily: DailyEntry[];
  topContent: TopContentEntry[];
};

type DaysOption = 7 | 30 | 90;

export function AnalyticsPageClient() {
  const [days, setDays] = useState<DaysOption>(7);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`);
        if (!res.ok) {
          throw new Error("Failed to load analytics");
        }
        const data = (await res.json()) as AnalyticsOverview;
        if (!cancelled) {
          setOverview(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [days]);

  function handleDaysChange(next: DaysOption) {
    if (next !== days) {
      setDays(next);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-zinc-400">
          Traffic overview and top content based on views and clicks.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-100">Overview</h2>
          <div className="inline-flex gap-1 rounded-full border border-zinc-700 bg-zinc-950 p-1 text-xs">
            {[7, 30, 90].map((value) => {
              const option = value as DaysOption;
              const active = option === days;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleDaysChange(option)}
                  className={
                    active
                      ? "rounded-full bg-zinc-100 px-3 py-1 font-semibold text-zinc-950"
                      : "rounded-full px-3 py-1 text-zinc-300 hover:bg-zinc-800"
                  }
                >
                  {option}d
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-zinc-400">Loading analytics5</p>
        ) : !overview ? (
          <p className="text-sm text-zinc-400">
            No analytics data available yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Daily totals
              </h3>
              <div className="max-h-64 overflow-auto rounded-md border border-zinc-800 bg-zinc-950/60">
                <table className="min-w-full border-collapse text-xs">
                  <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wide text-zinc-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-right font-medium">Views</th>
                      <th className="px-3 py-2 text-right font-medium">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.daily.map((entry) => (
                      <tr
                        key={entry.date}
                        className="border-t border-zinc-800 text-xs"
                      >
                        <td className="px-3 py-1.5 text-zinc-100">
                          {entry.date}
                        </td>
                        <td className="px-3 py-1.5 text-right text-zinc-200">
                          {entry.views}
                        </td>
                        <td className="px-3 py-1.5 text-right text-zinc-200">
                          {entry.clicks}
                        </td>
                      </tr>
                    ))}
                    {overview.daily.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-2 text-sm text-zinc-400"
                        >
                          No data in this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Top content
              </h3>
              <div className="max-h-64 overflow-auto rounded-md border border-zinc-800 bg-zinc-950/60">
                <table className="min-w-full border-collapse text-xs">
                  <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wide text-zinc-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Title</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                      <th className="px-3 py-2 text-right font-medium">Views</th>
                      <th className="px-3 py-2 text-right font-medium">Clicks</th>
                      <th className="px-3 py-2 text-right font-medium">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.topContent.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-zinc-800 text-xs"
                      >
                        <td className="px-3 py-1.5 text-zinc-100">
                          {item.title}
                        </td>
                        <td className="px-3 py-1.5 text-zinc-400">
                          {item.type}
                        </td>
                        <td className="px-3 py-1.5 text-right text-zinc-200">
                          {item.totalViews}
                        </td>
                        <td className="px-3 py-1.5 text-right text-zinc-200">
                          {item.totalClicks}
                        </td>
                        <td className="px-3 py-1.5 text-right text-zinc-200">
                          {(item.ctr * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                    {overview.topContent.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-2 text-sm text-zinc-400"
                        >
                          No content has recorded analytics yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
