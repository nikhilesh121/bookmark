"use client";

import { useEffect, useState } from "react";

import type { AdminCategory } from "../categories/CategoriesPageClient";

type AdminContentStatus = "PUBLISHED" | "DRAFT" | "HIDDEN";

type AdminContentType = "MANGA" | "ANIME" | "MOVIE";

type AdminContentItem = {
  id: number;
  title: string;
  slug: string;
  type: AdminContentType;
  imageUrl: string;
  description: string | null;
  externalUrl: string;
  status: AdminContentStatus;
  directRedirect: boolean;
  createdAt: string;
  categories: {
    category: {
      id: number;
      name: string;
    };
  }[];
};

const TYPE_OPTIONS: AdminContentType[] = ["MANGA", "ANIME", "MOVIE"];
const STATUS_OPTIONS: AdminContentStatus[] = [
  "PUBLISHED",
  "DRAFT",
  "HIDDEN",
];

export function ContentPageClient() {
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AdminContentType>("MANGA");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [status, setStatus] = useState<AdminContentStatus>("PUBLISHED");
  const [directRedirect, setDirectRedirect] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [contentRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/content"),
          fetch("/api/admin/categories"),
        ]);

        if (!contentRes.ok) {
          throw new Error("Failed to load content");
        }
        if (!categoriesRes.ok) {
          throw new Error("Failed to load categories");
        }

        const contentData = (await contentRes.json()) as AdminContentItem[];
        const categoryData = (await categoriesRes.json()) as AdminCategory[];

        setItems(contentData);
        setCategories(categoryData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function resetForm() {
    setTitle("");
    setType("MANGA");
    setImageUrl("");
    setDescription("");
    setExternalUrl("");
    setStatus("PUBLISHED");
    setDirectRedirect(false);
    setSelectedCategoryIds([]);
    setEditingId(null);
  }

  function startEdit(item: AdminContentItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setType(item.type);
    setImageUrl(item.imageUrl);
    setDescription(item.description ?? "");
    setExternalUrl(item.externalUrl);
    setStatus(item.status);
    setDirectRedirect(item.directRedirect);
    setSelectedCategoryIds(item.categories.map((c) => c.category.id));
  }

  function toggleCategory(categoryId: number) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      title,
      type,
      imageUrl,
      description: description || null,
      externalUrl,
      status,
      directRedirect,
      categoryIds: selectedCategoryIds,
    };

    try {
      const url = editingId
        ? `/api/admin/content/${editingId}`
        : "/api/admin/content";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to save content");
      }

      const saved = (await res.json()) as AdminContentItem;

      setItems((prev) => {
        const next = editingId
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev];
        return next;
      });

      resetForm();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(item: AdminContentItem) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;

    setError(null);
    try {
      const res = await fetch(`/api/admin/content/${item.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to delete content");
      }

      setItems((prev) => prev.filter((entry) => entry.id !== item.id));

      if (editingId === item.id) {
        resetForm();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
        <p className="text-sm text-zinc-400">
          Manage Manga, Anime, and Movie entries that appear on the public
          site.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-100">
            {editingId ? "Edit content" : "Add content"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-zinc-300 hover:text-zinc-100"
            >
              Cancel editing
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2"
        >
          <div className="flex flex-col">
            <label
              htmlFor="title"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Title
            </label>
            <input
              id="title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
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
              onChange={(event) => setType(event.target.value as AdminContentType)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
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
              required
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="externalUrl"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              External URL
            </label>
            <input
              id="externalUrl"
              required
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label
              htmlFor="description"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex flex-col">
            <span className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Categories
            </span>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => {
                const selected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      selected
                        ? "border-zinc-50 bg-zinc-50 text-zinc-950"
                        : "border-zinc-600 bg-zinc-900 text-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-zinc-500">
                  No categories yet. Create some first.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="status"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminContentStatus)
              }
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-center gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-zinc-200">
              <input
                type="checkbox"
                checked={directRedirect}
                onChange={(event) => setDirectRedirect(event.target.checked)}
                className="h-4 w-4 rounded border border-zinc-600 bg-zinc-950"
              />
              Direct redirect (skip detail page)
            </label>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-50 px-4 text-xs font-semibold uppercase tracking-wide text-zinc-950 hover:bg-zinc-200"
            >
              {editingId ? "Save changes" : "Add content"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-100">
          Existing content
        </h2>
        {loading ? (
          <p className="text-sm text-zinc-400">Loading content4</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-400">No content yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/60">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Title</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Categories</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2 align-top text-zinc-50">
                      <div className="line-clamp-2 text-sm font-medium">
                        {item.title}
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500">
                        {item.slug}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      <div>{item.type}</div>
                      {item.directRedirect && (
                        <div className="mt-1 text-[11px] text-emerald-400">
                          Direct redirect
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      {item.status}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      {item.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.categories.map((entry) => (
                            <span
                              key={entry.category.id}
                              className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-100"
                            >
                              {entry.category.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-500">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-xs">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-md border border-zinc-600 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-md border border-red-500/60 px-3 py-1 text-xs text-red-200 hover:border-red-400"
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
