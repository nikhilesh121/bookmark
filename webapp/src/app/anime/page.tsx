import Link from "next/link";

import { AdSlot } from "@/components/AdSlot";
import { listPublicCategoriesForType, listPublicContent } from "@/lib/contentService";

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function AnimePage({ searchParams }: PageProps) {
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
      type: "ANIME",
      categorySlug,
      search: q,
      sort,
      page: safePage,
      pageSize: 24,
    }),
    listPublicCategoriesForType("ANIME"),
  ]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="flex w-full flex-col">
      <section className="bg-gradient-to-r from-pink-500 to-rose-500 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Anime</h1>
          </div>
          <p className="text-white/80 text-sm max-w-md">
            Discover amazing anime series and movies.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6">
        <AdSlot position="listing_top" />

        <form className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-3 sm:p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="col-span-2">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="q"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Search anime..."
                  className="input-elegant w-full pl-9 text-sm"
                />
              </div>
            </div>
            <select
              id="category"
              name="category"
              defaultValue={categorySlug ?? ""}
              className="input-elegant w-full text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="input-elegant w-full text-sm"
              >
                <option value="new">Newest</option>
                <option value="az">A-Z</option>
                <option value="views">Popular</option>
              </select>
              <button type="submit" className="btn-primary text-sm px-3 whitespace-nowrap">
                Go
              </button>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{data.items.length} of {data.total} anime</span>
          <span>Page {data.page}/{totalPages}</span>
        </div>

        <div className="grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
          {data.items.map((item: any) => (
            <Link
              key={item.id}
              href={`/content/${item.slug}`}
              className="content-card card-hover group aspect-[3/4] bg-zinc-200 dark:bg-zinc-800"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="content-card-info">
                <h3 className="font-semibold text-xs sm:text-sm line-clamp-2">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        {data.items.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">No anime found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Try adjusting your search</p>
          </div>
        )}

        {data.items.length > 0 && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {data.page > 1 && (
              <Link
                href={{ query: { ...params, page: String(data.page - 1) } }}
                className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-medium hover:border-pink-400 transition-colors"
              >
                Prev
              </Link>
            )}
            <span className="px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              {data.page}/{totalPages}
            </span>
            {data.page < totalPages && (
              <Link
                href={{ query: { ...params, page: String(data.page + 1) } }}
                className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-medium hover:border-pink-400 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}

        <AdSlot position="listing_bottom" />
      </div>
    </div>
  );
}
