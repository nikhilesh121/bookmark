import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateSiteSettings } from "@/lib/settings";

export default async function Home() {
  const [latestManga, latestAnime, latestMovies, trending, popularCategories, settings] =
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
      getOrCreateSiteSettings(),
    ]);

  const bannerTitle = settings.bannerTitle || "Discover Your Next";
  const bannerSubtitle = settings.bannerSubtitle || "Favorite Story";
  const bannerDescription = settings.bannerDescription || "Browse our curated collection of manga, anime, and movies.";
  const bannerBgColor = settings.bannerBgColor || null;
  const bannerBgImage = settings.bannerBgImage || null;
  const bannerTextColor = settings.bannerTextColor || "#ffffff";
  const btn1Text = settings.bannerBtn1Text || "Browse Manga";
  const btn1Link = settings.bannerBtn1Link || "/manga";
  const btn1Color = settings.bannerBtn1Color || "#fde047";
  const btn2Text = settings.bannerBtn2Text || "Watch Anime";
  const btn2Link = settings.bannerBtn2Link || "/anime";
  const btn2Color = settings.bannerBtn2Color || "rgba(255,255,255,0.2)";

  const bannerStyle: React.CSSProperties = {
    backgroundColor: bannerBgColor || undefined,
    backgroundImage: bannerBgImage ? `url(${bannerBgImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: bannerTextColor,
  };

  return (
    <div className="flex w-full flex-col">
      <section
        className={`py-10 sm:py-16 ${!bannerBgColor && !bannerBgImage ? "gradient-bg" : ""}`}
        style={bannerBgColor || bannerBgImage ? bannerStyle : undefined}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="max-w-2xl">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
              style={{ color: bannerTextColor }}
            >
              {bannerTitle}
              <span
                className="block"
                style={{ color: btn1Color }}
              >
                {bannerSubtitle}
              </span>
            </h1>
            <p
              className="mt-4 text-sm sm:text-base max-w-md"
              style={{ color: bannerTextColor, opacity: 0.8 }}
            >
              {bannerDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {btn1Text && (
                <Link
                  href={btn1Link}
                  className="inline-flex items-center gap-2 font-semibold px-4 py-2 rounded-full transition-all text-sm"
                  style={{
                    backgroundColor: btn1Color,
                    color: bannerBgColor || "#1e1b4b",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {btn1Text}
                </Link>
              )}
              {btn2Text && (
                <Link
                  href={btn2Link}
                  className="inline-flex items-center gap-2 backdrop-blur font-semibold px-4 py-2 rounded-full hover:opacity-80 transition-all text-sm"
                  style={{
                    backgroundColor: btn2Color,
                    color: bannerTextColor,
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {btn2Text}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-10 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Trending Now</h2>
          </div>
          <div className="grid gap-3 grid-cols-3 sm:grid-cols-6">
            {trending.map((item: any) => (
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
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-white/20 backdrop-blur mb-1">
                    {item.type}
                  </span>
                  <h3 className="font-semibold text-xs sm:text-sm line-clamp-2">{item.title}</h3>
                </div>
              </Link>
            ))}
            {trending.length === 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 col-span-full text-center py-6">
                No content yet. Add some from the admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-10 dark:bg-zinc-800/50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Latest Manga</h2>
            <Link href="/manga" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {latestManga.map((item: any) => (
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
                  <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                </div>
              </Link>
            ))}
            {latestManga.length === 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 col-span-full text-center py-6">
                No manga yet. Add some from the admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-10 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Latest Anime</h2>
            <Link href="/anime" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {latestAnime.map((item: any) => (
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
                  <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                </div>
              </Link>
            ))}
            {latestAnime.length === 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 col-span-full text-center py-6">
                No anime yet. Add some from the admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-10 dark:bg-zinc-800/50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Latest Movies</h2>
            <Link href="/movies" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {latestMovies.map((item: any) => (
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
                  <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                </div>
              </Link>
            ))}
            {latestMovies.length === 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 col-span-full text-center py-6">
                No movies yet. Add some from the admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      {popularCategories.length > 0 && (
        <section className="py-6 sm:py-10 bg-white dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 text-center">
            <h2 className="section-title mx-auto">Browse by Category</h2>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {popularCategories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/manga?category=${cat.slug}`}
                  className="category-pill"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 sm:py-14 gradient-bg">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to Explore?
          </h2>
          <p className="text-white/80 text-sm max-w-xl mx-auto mb-6">
            Discover your next favorite manga, anime, and movies through our curated directory.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/manga" className="bg-white text-indigo-600 font-semibold px-6 py-2 rounded-full hover:bg-zinc-100 transition-all shadow-lg text-sm">
              Start Browsing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
