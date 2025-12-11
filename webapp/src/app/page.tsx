import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [latestManga, latestAnime, latestMovies, trending, popularCategories] =
    await Promise.all([
      prisma.content.findMany({
        where: { status: "PUBLISHED", type: "MANGA" },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.content.findMany({
        where: { status: "PUBLISHED", type: "ANIME" },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.content.findMany({
        where: { status: "PUBLISHED", type: "MOVIE" },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.content.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { viewsTotal: "desc" },
        take: 6,
      }),
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        take: 8,
      }),
    ]);

  return (
    <div className="flex w-full flex-col">
      <section className="gradient-bg py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Discover Your Next
              <span className="block text-yellow-300">Favorite Story</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl">
              Browse our curated collection of manga, anime, and movies. 
              Find hand-picked links to the best streaming and reading sites.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/manga" className="btn-primary inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Browse Manga
              </Link>
              <Link href="/anime" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white font-semibold px-6 py-3 rounded-full hover:bg-white/30 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Anime
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title">Trending Now</h2>
              <p className="mt-4 text-zinc-500 text-sm">Most popular titles this week</p>
            </div>
          </div>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {trending.map((item: any) => (
              <Link
                key={item.id}
                href={`/content/${item.slug}`}
                className="content-card card-hover group aspect-[3/4] bg-zinc-100"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="content-card-info">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-white/20 backdrop-blur mb-2">
                    {item.type}
                  </span>
                  <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-white/70 mt-1">{item.viewsTotal.toLocaleString()} views</p>
                </div>
              </Link>
            ))}
            {trending.length === 0 && (
              <p className="text-sm text-zinc-500 col-span-full text-center py-8">
                No content yet. Add some from the admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title">Latest Manga</h2>
              <p className="mt-4 text-zinc-500 text-sm">New manga added to our collection</p>
            </div>
            <Link href="/manga" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all manga
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {latestManga.map((item: any) => (
              <Link
                key={item.id}
                href={`/content/${item.slug}`}
                className="content-card card-hover group aspect-[3/4] bg-zinc-100"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="content-card-info">
                  <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-white/70 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </Link>
            ))}
            {latestManga.length === 0 && (
              <p className="text-sm text-zinc-500 col-span-full text-center py-8">
                No manga yet. Add some from the admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title">Latest Anime</h2>
              <p className="mt-4 text-zinc-500 text-sm">Fresh anime series and movies</p>
            </div>
            <Link href="/anime" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all anime
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {latestAnime.map((item: any) => (
              <Link
                key={item.id}
                href={`/content/${item.slug}`}
                className="content-card card-hover group aspect-[3/4] bg-zinc-100"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="content-card-info">
                  <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-white/70 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </Link>
            ))}
            {latestAnime.length === 0 && (
              <p className="text-sm text-zinc-500 col-span-full text-center py-8">
                No anime yet. Add some from the admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title">Latest Movies</h2>
              <p className="mt-4 text-zinc-500 text-sm">Blockbusters and hidden gems</p>
            </div>
            <Link href="/movies" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all movies
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {latestMovies.map((item: any) => (
              <Link
                key={item.id}
                href={`/content/${item.slug}`}
                className="content-card card-hover group aspect-[3/4] bg-zinc-100"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="content-card-info">
                  <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-white/70 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </Link>
            ))}
            {latestMovies.length === 0 && (
              <p className="text-sm text-zinc-500 col-span-full text-center py-8">
                No movies yet. Add some from the admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-zinc-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="section-title mx-auto">Browse by Category</h2>
            <p className="mt-6 text-zinc-500 text-sm">Find content by your favorite genres</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {popularCategories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/manga?category=${cat.slug}`}
                className="category-pill"
              >
                {cat.name}
              </Link>
            ))}
            {popularCategories.length === 0 && (
              <p className="text-sm text-zinc-500">
                No categories yet. Create categories from the admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 gradient-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of fans who discover their next favorite manga, anime, and movies through our curated directory.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/manga" className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full hover:bg-zinc-100 transition-all shadow-lg">
              Start Browsing
            </Link>
            <Link href="/admin" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-all">
              Add Content
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
