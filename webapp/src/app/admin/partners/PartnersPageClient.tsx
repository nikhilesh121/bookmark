"use client";

import { useState, useEffect } from "react";

type Partner = {
  id: number;
  name: string;
  slug: string;
  websiteUrl: string;
  logoUrl: string | null;
  isVerified: boolean;
  priorityScore: number;
  description: string | null;
  _count: {
    links: number;
  };
};

export function PartnersPageClient() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [priorityScore, setPriorityScore] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/partners");
        if (!res.ok) throw new Error("Failed to load partners");
        const data = await res.json();
        setPartners(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  function resetForm() {
    setName("");
    setWebsiteUrl("");
    setLogoUrl("");
    setDescription("");
    setIsVerified(false);
    setPriorityScore(0);
    setEditingId(null);
  }

  function startEdit(partner: Partner) {
    setEditingId(partner.id);
    setName(partner.name);
    setWebsiteUrl(partner.websiteUrl);
    setLogoUrl(partner.logoUrl || "");
    setDescription(partner.description || "");
    setIsVerified(partner.isVerified);
    setPriorityScore(partner.priorityScore);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      websiteUrl,
      logoUrl: logoUrl || null,
      description: description || null,
      isVerified,
      priorityScore,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/partners/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update partner");

        const updated = await res.json();
        setPartners((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const res = await fetch("/api/admin/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create partner");
        }

        const created = await res.json();
        setPartners((prev) => [...prev, { ...created, _count: { links: 0 } }]);
      }

      resetForm();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(partner: Partner) {
    if (!confirm(`Delete partner "${partner.name}"? This will remove the partner from all links.`)) return;

    try {
      const res = await fetch(`/api/admin/partners/${partner.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete partner");

      setPartners((prev) => prev.filter((p) => p.id !== partner.id));
      if (editingId === partner.id) resetForm();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Partner Websites</h1>

      {error && (
        <div className="rounded-lg bg-red-900/50 border border-red-700 p-4 text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">
            {editingId ? "Edit Partner" : "Add Partner"}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs text-zinc-300 hover:text-zinc-100">
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Partner Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Website URL
            </label>
            <input
              required
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Logo URL (optional)
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Priority Score
            </label>
            <input
              type="number"
              value={priorityScore}
              onChange={(e) => setPriorityScore(Number(e.target.value))}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isVerified"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
            />
            <label htmlFor="isVerified" className="text-sm text-zinc-300">
              Verified Partner
            </label>
          </div>

          <div className="flex items-end justify-end">
            <button
              type="submit"
              className="h-9 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {editingId ? "Save Changes" : "Add Partner"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">
          Partners ({partners.length})
        </h2>

        {partners.length === 0 ? (
          <p className="text-sm text-zinc-400">No partners yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-zinc-100 flex items-center gap-2">
                      {partner.name}
                      {partner.isVerified && (
                        <span className="text-green-400 text-sm">✓ Verified</span>
                      )}
                    </h3>
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      {partner.websiteUrl}
                    </a>
                  </div>
                  {partner.logoUrl && (
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                  <span>Priority: {partner.priorityScore}</span>
                  <span>{partner._count.links} links</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(partner)}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(partner)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
