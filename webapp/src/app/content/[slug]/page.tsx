import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/AdSlot";
import { ContentActions } from "@/components/ContentActions";
import { ContentLinks } from "@/components/ContentLinks";
import { ReportModal } from "@/components/ReportModal";
import { SuggestedContent } from "@/components/SuggestedContent";
import { incrementContentView } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await prisma.content.findUnique({
    where: { slug },
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
  const { slug } = await params;
  const content = await prisma.content.findUnique({
    where: { slug },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      links: {
        include: {
          partner: {
            select: { id: true, name: true, isVerified: true, logoUrl: true },
          },
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!content || content.status !== "PUBLISHED") {
    notFound();
  }

  await incrementContentView(content.id);

  const categoryIds = content.categories.map((c) => c.categoryId);
  const suggestedContent = await prisma.content.findMany({
    where: {
      id: { not: content.id },
      status: "PUBLISHED",
      OR: [
        { type: content.type },
        ...(categoryIds.length > 0
          ? [{ categories: { some: { categoryId: { in: categoryIds } } } }]
          : []),
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      imageUrl: true,
      rating: true,
    },
    orderBy: { viewsTotal: "desc" },
    take: 6,
  });

  const categoryNames = content.categories
    .map((entry) => entry.category.name)
    .filter(Boolean);

  const tags = content.tags ? content.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const typeColors: Record<string, string> = {
    MANGA: "from-indigo-600 to-purple-600",
    ANIME: "from-pink-500 to-rose-500",
    MOVIE: "from-amber-500 to-orange-500",
  };

  const gradientClass = typeColors[content.type] || "from-zinc-600 to-zinc-800";

  return (
    <div className="flex w-full flex-col">
      <section className={`bg-gradient-to-r ${gradientClass} py-6 sm:py-8`}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link 
              href={`/${content.type.toLowerCase()}`}
              className="font-medium text-white/70 hover:text-white transition-colors"
            >
              {content.type.charAt(0) + content.type.slice(1).toLowerCase()}
            </Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white truncate">{content.title}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6">
        <AdSlot position="content_top" />

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 p-3 sm:p-4">
              <div className="overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-700">
                <img
                  src={content.imageUrl}
                  alt={content.title}
                  className="h-full w-full object-cover aspect-[3/4]"
                />
              </div>
            </div>
            <div className="sm:w-2/3 p-3 sm:p-4 flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-gradient-to-r ${gradientClass} text-white`}>
                    {content.type}
                  </span>
                  <ContentActions contentId={content.id} contentSlug={content.slug} title={content.title} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  {content.title}
                </h1>
                
                {categoryNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {categoryNames.map((name) => (
                      <span
                        key={name}
                        className="category-pill text-[10px]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {content.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {content.rating.toFixed(1)}
                    </span>
                  </div>
                )}

                {content.description && (
                  <div className="mb-4">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {content.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{content.viewsTotal.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{content.clicksTotal.toLocaleString()} clicks</span>
                  </div>
                </div>
              </div>

              <AdSlot position="content_mid" />

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Available Sources
                </h3>
                
                <ContentLinks 
                  links={content.links} 
                  contentSlug={content.slug} 
                  contentType={content.type}
                  fallbackUrl={content.externalUrl}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <AdSlot position="content_bottom" />
        </div>

        {suggestedContent.length > 0 && (
          <div className="mt-6">
            <SuggestedContent items={suggestedContent} currentType={content.type} />
          </div>
        )}

        <div className="mt-4 text-center">
          <Link
            href={`/${content.type.toLowerCase()}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {content.type.charAt(0) + content.type.slice(1).toLowerCase()}
          </Link>
        </div>
      </div>

      <ReportModal contentId={content.id} />
    </div>
  );
}
