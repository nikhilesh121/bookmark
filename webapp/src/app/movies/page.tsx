import Link from "next/link";

import { AdSlot } from "@/components/AdSlot";
import { listPublicCategoriesForType, listPublicContent } from "@/lib/contentService";

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function MoviesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug =
    typeof params?.category === "string" ? params.category : undefined;
  const q = typeof params?.q === "string" ? params.q : undefined;
  const sortParam =
    typeof params?.sort === "string" ? params.sort : undefined;
  const sort = sortParam === "az" || sortParam === "views" ? sortParam : "new";

  const pageParam =
    typeof params?.page === "string" ? params.page : undefined;
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
    <div className="flex w-full flex-col">
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Movies</h1>
          </div>
          <p className="text-white/80 text-lg max-w-xl">
            Explore blockbusters and hidden gems. Find your next movie night pick!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AdSlot position="listing_top" />

        <form className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="q" className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                Search
              </label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="q"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Search movie titles..."
                  className="input-elegant w-full pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={categorySlug ?? ""}
                className="input-elegant w-full"
              >
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="input-elegant w-full"
              >
                <option value="new">Newest First</option>
                <option value="az">A to Z</option>
                <option value="views">Most Popular</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn-primary">
              Apply Filters
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-zinc-500">
            Showing <span className="font-semibold text-zinc-700">{data.items.length}</span> of{" "}
            <span className="font-semibold text-zinc-700">{data.total}</span> movies
          </p>
          <p className="text-sm text-zinc-500">
            Page {data.page} of {totalPages}
          </p>
        </div>

        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {data.items.map((item: any) => {
            const href = item.directRedirect
              ? `/go/${item.slug}`
              : `/content/${item.slug}`;
            return (
              <a
                key={item.id}
                href={href}
                className="content-card card-hover group aspect-[3/4] bg-zinc-100"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="content-card-info">
                  <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-white/70 mt-1 line-clamp-1">
                    {item.categories
                      .map((c: any) => c.category.name)
                      .filter(Boolean)
                      .join(", ") || "Uncategorized"}
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        {data.items.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">No movies found</h3>
            <p className="text-zinc-500">Try adjusting your search or filters</p>
          </div>
        )}

        {data.items.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {data.page > 1 && (
              <Link
                href={{
                  query: {
                    ...params,
                    page: String(data.page - 1),
                  },
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-zinc-200 bg-white font-medium text-sm hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-zinc-500">
              {data.page} / {totalPages}
            </span>
            {data.page < totalPages && (
              <Link
                href={{
                  query: {
                    ...params,
                    page: String(data.page + 1),
                  },
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-zinc-200 bg-white font-medium text-sm hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}

        <AdSlot position="listing_bottom" />
      </div>
    </div>
  );
}
