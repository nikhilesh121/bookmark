import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [latestManga, latestAnime, latestMovies, trending, popularCategories] =
    await Promise.all([
      prisma.content.findMany({
        where: { status: "PUBLISHED", type: "MANGA" },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.content.findMany({
        where: { status: "PUBLISHED", type: "ANIME" },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.content.findMany({
        where: { status: "PUBLISHED", type: "MOVIE" },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.content.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        take: 10,
      }),
    ]);

  return (
    <div className="flex w-full flex-col gap-10">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Discover Manga, Anime, and Movies
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Browse hand-picked links to streaming and reading sites. We collect
            titles and send you directly to where you can watch or read them.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Trending This Week</h2>
          <p className="text-xs text-zinc-500">
            Based on the latest additions. Detailed analytics will arrive in a
            later phase.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((item: any) => (
            <Link
              key={item.id}
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <p className="line-clamp-2 font-medium text-zinc-900 group-hover:text-zinc-950">
                {item.title}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                {item.type.toLowerCase()}
              </p>
            </Link>
          ))}
          {trending.length === 0 && (
            <p className="text-sm text-zinc-500">
              No items yet. Add content from the admin panel.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest Manga</h2>
          <Link
            href="/manga"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latestManga.map((item: any) => (
            <Link
              key={item.id}
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <p className="line-clamp-2 font-medium text-zinc-900 group-hover:text-zinc-950">
                {item.title}
              </p>
            </Link>
          ))}
          {latestManga.length === 0 && (
            <p className="text-sm text-zinc-500">
              No manga yet. Add some from the admin panel.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest Anime</h2>
          <Link
            href="/anime"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latestAnime.map((item: any) => (
            <Link
              key={item.id}
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <p className="line-clamp-2 font-medium text-zinc-900 group-hover:text-zinc-950">
                {item.title}
              </p>
            </Link>
          ))}
          {latestAnime.length === 0 && (
            <p className="text-sm text-zinc-500">
              No anime yet. Add some from the admin panel.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest Movies</h2>
          <Link
            href="/movies"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latestMovies.map((item: any) => (
            <Link
              key={item.id}
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <p className="line-clamp-2 font-medium text-zinc-900 group-hover:text-zinc-950">
                {item.title}
              </p>
            </Link>
          ))}
          {latestMovies.length === 0 && (
            <p className="text-sm text-zinc-500">
              No movies yet. Add some from the admin panel.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Popular Categories</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {popularCategories.map((cat: any) => (
            <span
              key={cat.id}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-700"
            >
              {cat.name}
            </span>
          ))}
          {popularCategories.length === 0 && (
            <p className="text-sm text-zinc-500">
              No categories yet. Create categories from the admin panel.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
