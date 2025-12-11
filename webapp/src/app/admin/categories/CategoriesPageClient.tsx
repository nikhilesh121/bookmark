"use client";

import { useEffect, useState } from "react";

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  typeScope: "MANGA" | "ANIME" | "MOVIE" | "UNIVERSAL";
  sortOrder: number;
};

const TYPE_SCOPE_OPTIONS: AdminCategory["typeScope"][] = [
  "MANGA",
  "ANIME",
  "MOVIE",
  "UNIVERSAL",
];

export function CategoriesPageClient() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [typeScope, setTypeScope] = useState<AdminCategory["typeScope"]>(
    "MANGA",
  );
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editTypeScope, setEditTypeScope] =
    useState<AdminCategory["typeScope"]>("MANGA");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) {
          throw new Error("Failed to load categories");
        }
        const data = (await res.json()) as AdminCategory[];
        setCategories(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, typeScope, sortOrder }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to create category");
      }

      const created = (await res.json()) as AdminCategory;
      setCategories((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setName("");
      setTypeScope("MANGA");
      setSortOrder(0);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditTypeScope(category.typeScope);
    setEditSortOrder(category.sortOrder);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditTypeScope("MANGA");
    setEditSortOrder(0);
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setError(null);

    try {
      const res = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          typeScope: editTypeScope,
          sortOrder: editSortOrder,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to update category");
      }

      const updated = (await res.json()) as AdminCategory;
      setCategories((prev) =>
        prev
          .map((cat) => (cat.id === updated.id ? updated : cat))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      cancelEdit();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(category: AdminCategory) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to delete category");
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== category.id));
      if (editingId === category.id) {
        cancelEdit();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-zinc-400">
          Manage categories for Manga, Anime, Movies, and universal tags.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-100">Add category</h2>
        <form
          onSubmit={handleCreate}
          className="flex flex-wrap items-end gap-3 text-sm"
        >
          <div className="flex min-w-[180px] flex-1 flex-col">
            <label
              htmlFor="name"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Name
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex min-w-[140px] flex-col">
            <label
              htmlFor="typeScope"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Scope
            </label>
            <select
              id="typeScope"
              value={typeScope}
              onChange={(event) =>
                setTypeScope(event.target.value as AdminCategory["typeScope"])
              }
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              {TYPE_SCOPE_OPTIONS.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-[100px] flex-col">
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

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-50 px-4 text-xs font-semibold uppercase tracking-wide text-zinc-950 hover:bg-zinc-200"
          >
            Add
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-100">Existing categories</h2>
        {loading ? (
          <p className="text-sm text-zinc-400">Loading categories4</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-zinc-400">No categories yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/60">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Scope</th>
                  <th className="px-3 py-2 text-left font-medium">Slug</th>
                  <th className="px-3 py-2 text-left font-medium">Sort</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2 align-top text-zinc-50">
                      {editingId === category.id ? (
                        <input
                          value={editName}
                          onChange={(event) =>
                            setEditName(event.target.value)
                          }
                          className="h-8 w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      {editingId === category.id ? (
                        <select
                          value={editTypeScope}
                          onChange={(event) =>
                            setEditTypeScope(
                              event.target.value as AdminCategory["typeScope"],
                            )
                          }
                          className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                        >
                          {TYPE_SCOPE_OPTIONS.map((scope) => (
                            <option key={scope} value={scope}>
                              {scope}
                            </option>
                          ))}
                        </select>
                      ) : (
                        category.typeScope
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-500">
                      {category.slug}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      {editingId === category.id ? (
                        <input
                          type="number"
                          value={editSortOrder}
                          onChange={(event) =>
                            setEditSortOrder(Number(event.target.value))
                          }
                          className="h-8 w-20 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                        />
                      ) : (
                        category.sortOrder
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-xs">
                      {editingId === category.id ? (
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
                            onClick={() => startEdit(category)}
                            className="rounded-md border border-zinc-600 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-400"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
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
