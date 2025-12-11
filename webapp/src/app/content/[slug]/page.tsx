import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/AdSlot";
import { incrementContentView } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const content = await prisma.content.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      description: true,
      imageUrl: true,
    },
  });

  if (!content) {
    return {
      title: "Content not found",
    };
  }

  return {
    title: content.title,
    description: content.description ?? undefined,
    openGraph: {
      title: content.title,
      description: content.description ?? undefined,
      images: content.imageUrl ? [{ url: content.imageUrl }] : undefined,
    },
  };
}

export default async function ContentDetailPage({ params }: PageProps) {
  const content = await prisma.content.findUnique({
    where: { slug: params.slug },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!content || content.status !== "PUBLISHED") {
    notFound();
  }

  await incrementContentView(content.id);

  const categoryNames = content.categories
    .map((entry) => entry.category.name)
    .filter(Boolean);

  const typeColors: Record<string, string> = {
    MANGA: "from-indigo-600 to-purple-600",
    ANIME: "from-pink-500 to-rose-500",
    MOVIE: "from-amber-500 to-orange-500",
  };

  const gradientClass = typeColors[content.type] || "from-zinc-600 to-zinc-800";

  return (
    <div className="flex w-full flex-col">
      <section className={`bg-gradient-to-r ${gradientClass} py-8 sm:py-12`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href={`/${content.type.toLowerCase()}`}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {content.type.charAt(0) + content.type.slice(1).toLowerCase()}
            </Link>
            <span className="text-white/50">/</span>
            <span className="text-sm font-medium text-white">{content.title}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AdSlot position="content_top" />

        <div className="bg-white rounded-3xl shadow-lg border border-zinc-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3 p-6 lg:p-8">
              <div className="overflow-hidden rounded-2xl bg-zinc-100 shadow-inner">
                <img
                  src={content.imageUrl}
                  alt={content.title}
                  className="h-full w-full object-cover aspect-[3/4]"
                />
              </div>
            </div>
            <div className="lg:w-2/3 p-6 lg:p-8 flex flex-col">
              <div className="flex-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gradient-to-r ${gradientClass} text-white mb-4`}>
                  {content.type}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 mb-4">
                  {content.title}
                </h1>
                
                {categoryNames.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categoryNames.map((name) => (
                      <span
                        key={name}
                        className="category-pill text-xs"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}

                {content.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-2">Description</h3>
                    <p className="text-zinc-700 leading-relaxed whitespace-pre-line">
                      {content.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-6 text-sm text-zinc-500 mb-6">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{content.viewsTotal.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{content.clicksTotal.toLocaleString()} clicks</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100">
                <Link
                  href={content.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {content.type === "MANGA" ? "Read Now" : content.type === "ANIME" ? "Watch Now" : "Stream Now"}
                </Link>
                <p className="text-xs text-zinc-400 mt-3">
                  Opens in a new tab. Links to external streaming or reading sites.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <AdSlot position="content_bottom" />
        </div>

        <div className="mt-8 text-center">
          <Link
            href={`/${content.type.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {content.type.charAt(0) + content.type.slice(1).toLowerCase()}
          </Link>
        </div>
      </div>
    </div>
  );
}
