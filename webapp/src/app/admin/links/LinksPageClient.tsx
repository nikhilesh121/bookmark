"use client";

import { useState, useEffect } from "react";

type ContentItem = {
  id: number;
  title: string;
  slug: string;
};

type Partner = {
  id: number;
  name: string;
  isVerified: boolean;
};

type ContentLink = {
  id: number;
  contentId: number;
  partnerId: number | null;
  url: string;
  sourceName: string;
  linkType: "READ" | "WATCH" | "DOWNLOAD" | "VISIT" | "MIRROR" | "EXTERNAL";
  status: "VERIFIED" | "UNVERIFIED" | "BLOCKED";
  priority: number;
  clickCount: number;
  partner: Partner | null;
  content: ContentItem;
};

const LINK_TYPES = ["READ", "WATCH", "DOWNLOAD", "VISIT", "MIRROR", "EXTERNAL"] as const;
const LINK_STATUSES = ["VERIFIED", "UNVERIFIED", "BLOCKED"] as const;

export function LinksPageClient() {
  const [links, setLinks] = useState<ContentLink[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterContentId, setFilterContentId] = useState<string>("");

  const [contentId, setContentId] = useState<string>("");
  const [url, setUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [linkType, setLinkType] = useState<ContentLink["linkType"]>("VISIT");
  const [status, setStatus] = useState<ContentLink["status"]>("UNVERIFIED");
  const [priority, setPriority] = useState(0);
  const [partnerId, setPartnerId] = useState<string>("");

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [linksRes, contentsRes, partnersRes] = await Promise.all([
          fetch("/api/admin/links"),
          fetch("/api/admin/content"),
          fetch("/api/admin/partners"),
        ]);

        if (!linksRes.ok || !contentsRes.ok || !partnersRes.ok) {
          throw new Error("Failed to load data");
        }

        const [linksData, contentsData, partnersData] = await Promise.all([
          linksRes.json(),
          contentsRes.json(),
          partnersRes.json(),
        ]);

        setLinks(linksData);
        setContents(contentsData);
        setPartners(partnersData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function resetForm() {
    setContentId("");
    setUrl("");
    setSourceName("");
    setLinkType("VISIT");
    setStatus("UNVERIFIED");
    setPriority(0);
    setPartnerId("");
    setEditingId(null);
  }

  function startEdit(link: ContentLink) {
    setEditingId(link.id);
    setContentId(String(link.contentId));
    setUrl(link.url);
    setSourceName(link.sourceName);
    setLinkType(link.linkType);
    setStatus(link.status);
    setPriority(link.priority);
    setPartnerId(link.partnerId ? String(link.partnerId) : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      contentId: Number(contentId),
      url,
      sourceName,
      linkType,
      status,
      priority,
      partnerId: partnerId ? Number(partnerId) : null,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/links/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to update link");
        }

        const updated = await res.json();
        const content = contents.find((c) => c.id === updated.contentId);
        setLinks((prev) =>
          prev.map((l) =>
            l.id === editingId ? { ...updated, content: content || l.content } : l
          )
        );
      } else {
        const res = await fetch("/api/admin/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to create link");
        }

        const created = await res.json();
        const content = contents.find((c) => c.id === created.contentId);
        setLinks((prev) => [...prev, { ...created, content }]);
      }

      resetForm();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(link: ContentLink) {
    if (!confirm(`Delete link "${link.sourceName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/links/${link.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete link");
      }

      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      if (editingId === link.id) resetForm();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function quickStatusChange(link: ContentLink, newStatus: ContentLink["status"]) {
    try {
      const res = await fetch(`/api/admin/links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const filteredLinks = filterContentId
    ? links.filter((l) => l.contentId === Number(filterContentId))
    : links;

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
        <h1 className="text-2xl font-bold text-white">Content Links</h1>
        <select
          value={filterContentId}
          onChange={(e) => setFilterContentId(e.target.value)}
          className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
        >
          <option value="">All Content</option>
          {contents.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/50 border border-red-700 p-4 text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">
            {editingId ? "Edit Link" : "Add Link"}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs text-zinc-300 hover:text-zinc-100">
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Content
            </label>
            <select
              required
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            >
              <option value="">Select content...</option>
              {contents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Source Name
            </label>
            <input
              required
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. Website A"
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              URL
            </label>
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Link Type
            </label>
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as ContentLink["linkType"])}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            >
              {LINK_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContentLink["status"])}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            >
              {LINK_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Priority
            </label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Partner (optional)
            </label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50"
            >
              <option value="">None</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isVerified && "✓"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end md:col-span-2 lg:col-span-2">
            <button
              type="submit"
              className="h-9 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {editingId ? "Save Changes" : "Add Link"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">
          Links ({filteredLinks.length})
        </h2>

        {filteredLinks.length === 0 ? (
          <p className="text-sm text-zinc-400">No links found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-left text-xs uppercase text-zinc-400">
                  <th className="pb-2 pr-4">Content</th>
                  <th className="pb-2 pr-4">Source</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Clicks</th>
                  <th className="pb-2 pr-4">Partner</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="border-b border-zinc-800">
                    <td className="py-2 pr-4 text-zinc-200">{link.content?.title}</td>
                    <td className="py-2 pr-4 text-zinc-300">{link.sourceName}</td>
                    <td className="py-2 pr-4">
                      <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs">
                        {link.linkType}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <select
                        value={link.status}
                        onChange={(e) => quickStatusChange(link, e.target.value as ContentLink["status"])}
                        className={`rounded px-2 py-0.5 text-xs ${
                          link.status === "VERIFIED"
                            ? "bg-green-900/50 text-green-300"
                            : link.status === "BLOCKED"
                            ? "bg-red-900/50 text-red-300"
                            : "bg-yellow-900/50 text-yellow-300"
                        }`}
                      >
                        {LINK_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-4 text-zinc-400">{link.clickCount}</td>
                    <td className="py-2 pr-4 text-zinc-400">
                      {link.partner ? (
                        <span className="flex items-center gap-1">
                          {link.partner.name}
                          {link.partner.isVerified && (
                            <span className="text-green-400">✓</span>
                          )}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(link)}
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(link)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
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
