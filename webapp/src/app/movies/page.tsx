import Link from "next/link";

import { AdSlot } from "@/components/AdSlot";
import { listPublicCategoriesForType, listPublicContent } from "@/lib/contentService";

interface PageProps {
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function MoviesPage({ searchParams }: PageProps) {
  const categorySlug =
    typeof searchParams?.category === "string" ? searchParams.category : undefined;
  const q = typeof searchParams?.q === "string" ? searchParams.q : undefined;
  const sortParam =
    typeof searchParams?.sort === "string" ? searchParams.sort : undefined;
  const sort = sortParam === "az" || sortParam === "views" ? sortParam : "new";

  const pageParam =
    typeof searchParams?.page === "string" ? searchParams.page : undefined;
  const page = Number(pageParam || "1");
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  const [data, categories] = await Promise.all([
    listPublicContent({
      type: "MOVIE",
      categorySlug,
      search: q,
      sort,
      page: safePage,
      pageSize: 24,
    }),
    listPublicCategoriesForType("MOVIE"),
  ]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Movies
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Browse movies and jump directly to external streaming sites.
          </p>
        </div>
      </header>

      <AdSlot position="listing_top" />

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-sm">
        <div className="flex flex-1 flex-col min-w-[160px]">
          <label
            htmlFor="q"
            className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by title"
            className="h-9 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label
            htmlFor="category"
            className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={categorySlug ?? ""}
            className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          >
            <option value="">All</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label
            htmlFor="sort"
            className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          >
            <option value="new">Newest</option>
            <option value="az">A-Z</option>
            <option value="views">Most viewed</option>
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-xs font-medium uppercase tracking-wide text-white hover:bg-zinc-800"
        >
          Apply
        </button>
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing page {data.page} of {totalPages} ({data.total} items)
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((item: any) => {
            const href = item.directRedirect
              ? `/go/${item.slug}`
              : `/content/${item.slug}`;
            return (
              <a
                key={item.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
              >
                <div className="mb-2 h-40 w-full overflow-hidden rounded-md bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                  />
                </div>
                <p className="line-clamp-2 font-medium text-zinc-900 group-hover:text-zinc-950">
                  {item.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                  {item.categories
                    .map((c: any) => c.category.name)
                    .filter(Boolean)
                    .join(", ") || "Uncategorized"}
                </p>
              </a>
            );
          })}
          {data.items.length === 0 && (
            <p className="text-sm text-zinc-500">
              No movies found. Try adjusting your filters.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
          <div>
            Page {data.page} of {totalPages}
          </div>
          <div className="flex gap-2">
            {data.page > 1 && (
              <Link
                href={{
                  query: {
                    ...searchParams,
                    page: String(data.page - 1),
                  },
                }}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 hover:border-zinc-500"
              >
                Previous
              </Link>
            )}
            {data.page < totalPages && (
              <Link
                href={{
                  query: {
                    ...searchParams,
                    page: String(data.page + 1),
                  },
                }}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 hover:border-zinc-500"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </section>

      <AdSlot position="listing_bottom" />
    </div>
  );
}
