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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <AdSlot position="content_top" />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {content.type.toLowerCase()}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {content.title}
        </h1>
        {categoryNames.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
            {categoryNames.map((name) => (
              <span
                key={name}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-1/3">
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
            <img
              src={content.imageUrl}
              alt={content.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="w-full space-y-4 md:w-2/3">
          {content.description && (
            <p className="whitespace-pre-line text-sm text-zinc-700">
              {content.description}
            </p>
          )}
          <div>
            <Link
              href={content.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-xs font-semibold uppercase tracking-wide text-white hover:bg-zinc-800"
            >
              Open source
            </Link>
          </div>
        </div>
      </div>

      <AdSlot position="content_bottom" />
    </div>
  );
}
