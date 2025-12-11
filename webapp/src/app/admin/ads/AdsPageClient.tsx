"use client";

import { useEffect, useState } from "react";

type AdminAdType = "IMAGE" | "SCRIPT";

type AdminAd = {
  id: number;
  position: string;
  type: AdminAdType;
  imageUrl: string | null;
  scriptCode: string | null;
  targetUrl: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  sortOrder: number;
};

export function AdsPageClient() {
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [position, setPosition] = useState("");
  const [type, setType] = useState<AdminAdType>("IMAGE");
  const [imageUrl, setImageUrl] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPosition, setEditPosition] = useState("");
  const [editType, setEditType] = useState<AdminAdType>("IMAGE");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editScriptCode, setEditScriptCode] = useState("");
  const [editTargetUrl, setEditTargetUrl] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/ads");
        if (!res.ok) {
          throw new Error("Failed to load ads");
        }
        const data = (await res.json()) as AdminAd[];
        setAds(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function resetCreateForm() {
    setPosition("");
    setType("IMAGE");
    setImageUrl("");
    setScriptCode("");
    setTargetUrl("");
    setSortOrder(0);
    setStartDate("");
    setEndDate("");
  }

  function startEdit(ad: AdminAd) {
    setEditingId(ad.id);
    setEditPosition(ad.position);
    setEditType(ad.type);
    setEditImageUrl(ad.imageUrl ?? "");
    setEditScriptCode(ad.scriptCode ?? "");
    setEditTargetUrl(ad.targetUrl ?? "");
    setEditSortOrder(ad.sortOrder);
    setEditStartDate(ad.startDate ? ad.startDate.slice(0, 10) : "");
    setEditEndDate(ad.endDate ? ad.endDate.slice(0, 10) : "");
    setEditIsActive(ad.isActive);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditPosition("");
    setEditType("IMAGE");
    setEditImageUrl("");
    setEditScriptCode("");
    setEditTargetUrl("");
    setEditSortOrder(0);
    setEditStartDate("");
    setEditEndDate("");
    setEditIsActive(true);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position,
          type,
          imageUrl: imageUrl || null,
          scriptCode: scriptCode || null,
          targetUrl: targetUrl || null,
          sortOrder,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to create ad");
      }

      const created = (await res.json()) as AdminAd;
      setAds((prev) =>
        [...prev, created].sort((a, b) => {
          if (a.position === b.position) {
            return a.sortOrder - b.sortOrder;
          }
          return a.position.localeCompare(b.position);
        }),
      );
      resetCreateForm();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setError(null);

    try {
      const res = await fetch(`/api/admin/ads/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position: editPosition,
          type: editType,
          imageUrl: editImageUrl || null,
          scriptCode: editScriptCode || null,
          targetUrl: editTargetUrl || null,
          sortOrder: editSortOrder,
          startDate: editStartDate || null,
          endDate: editEndDate || null,
          isActive: editIsActive,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to update ad");
      }

      const updated = (await res.json()) as AdminAd;
      setAds((prev) =>
        prev
          .map((ad) => (ad.id === updated.id ? updated : ad))
          .sort((a, b) => {
            if (a.position === b.position) {
              return a.sortOrder - b.sortOrder;
            }
            return a.position.localeCompare(b.position);
          }),
      );
      cancelEdit();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(ad: AdminAd) {
    if (!window.confirm(`Delete ad in position "${ad.position}"?`)) return;

    setError(null);
    try {
      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to delete ad");
      }

      setAds((prev) => prev.filter((entry) => entry.id !== ad.id));
      if (editingId === ad.id) {
        cancelEdit();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ads</h1>
        <p className="text-sm text-zinc-400">
          Manage ad placements rendered through reusable slots.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-100">Add ad</h2>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2"
        >
          <div className="flex flex-col">
            <label
              htmlFor="position"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Position key
            </label>
            <input
              id="position"
              required
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              placeholder="e.g. listing_top"
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="type"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(event) => setType(event.target.value as AdminAdType)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value="IMAGE">Image</option>
              <option value="SCRIPT">Script</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="imageUrl"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Image URL
            </label>
            <input
              id="imageUrl"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="targetUrl"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Target URL
            </label>
            <input
              id="targetUrl"
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label
              htmlFor="scriptCode"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Script HTML
            </label>
            <textarea
              id="scriptCode"
              rows={3}
              value={scriptCode}
              onChange={(event) => setScriptCode(event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="sortOrder"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Sort order
            </label>
            <input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="startDate"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Start date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="endDate"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              End date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-50 px-4 text-xs font-semibold uppercase tracking-wide text-zinc-950 hover:bg-zinc-200"
          >
            Add ad
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-100">Existing ads</h2>
        {loading ? (
          <p className="text-sm text-zinc-400">Loading ads…</p>
        ) : ads.length === 0 ? (
          <p className="text-sm text-zinc-400">No ads configured yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/60">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Position</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Active</th>
                  <th className="px-3 py-2 text-left font-medium">Sort</th>
                  <th className="px-3 py-2 text-left font-medium">Dates</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2 align-top text-zinc-50">
                      {editingId === ad.id ? (
                        <input
                          value={editPosition}
                          onChange={(event) => setEditPosition(event.target.value)}
                          className="h-8 w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                        />
                      ) : (
                        ad.position
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      {editingId === ad.id ? (
                        <select
                          value={editType}
                          onChange={(event) =>
                            setEditType(event.target.value as AdminAdType)
                          }
                          className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                        >
                          <option value="IMAGE">Image</option>
                          <option value="SCRIPT">Script</option>
                        </select>
                      ) : (
                        ad.type
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      {editingId === ad.id ? (
                        <label className="inline-flex items-center gap-2 text-xs text-zinc-200">
                          <input
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(event) => setEditIsActive(event.target.checked)}
                            className="h-4 w-4 rounded border border-zinc-600 bg-zinc-950"
                          />
                          Active
                        </label>
                      ) : ad.isActive ? (
                        "Yes"
                      ) : (
                        "No"
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      {editingId === ad.id ? (
                        <input
                          type="number"
                          value={editSortOrder}
                          onChange={(event) =>
                            setEditSortOrder(Number(event.target.value))
                          }
                          className="h-8 w-20 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                        />
                      ) : (
                        ad.sortOrder
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      {editingId === ad.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="date"
                            value={editStartDate}
                            onChange={(event) => setEditStartDate(event.target.value)}
                            className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                          />
                          <input
                            type="date"
                            value={editEndDate}
                            onChange={(event) => setEditEndDate(event.target.value)}
                            className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span>{ad.startDate?.slice(0, 10) ?? "—"}</span>
                          <span>{ad.endDate?.slice(0, 10) ?? ""}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-xs">
                      {editingId === ad.id ? (
                        <form
                          onSubmit={handleUpdate}
                          className="inline-flex gap-2"
                        >
                          <button
                            type="submit"
                            className="rounded-md bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-zinc-200"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md border border-zinc-600 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-400"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(ad)}
                            className="rounded-md border border-zinc-600 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-400"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ad)}
                            className="rounded-md border border-red-500/60 px-3 py-1 text-xs text-red-200 hover:border-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
