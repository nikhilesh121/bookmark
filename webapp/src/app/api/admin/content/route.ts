import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.content.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    title,
    type,
    imageUrl,
    description,
    externalUrl,
    status,
    directRedirect,
    categoryIds,
  } = body as {
    title?: string;
    type?: "MANGA" | "ANIME" | "MOVIE";
    imageUrl?: string;
    description?: string | null;
    externalUrl?: string;
    status?: "PUBLISHED" | "DRAFT" | "HIDDEN";
    directRedirect?: boolean;
    categoryIds?: number[];
  };

  if (!title || !type || !imageUrl || !externalUrl) {
    return NextResponse.json(
      { error: "title, type, imageUrl and externalUrl are required" },
      { status: 400 }
    );
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 2;

  // ensure unique slug
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.content.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  const created = await prisma.content.create({
    data: {
      title,
      slug,
      type,
      imageUrl,
      description: description ?? null,
      externalUrl,
      status: status ?? "PUBLISHED",
      directRedirect: directRedirect ?? false,
    },
  });

  if (Array.isArray(categoryIds) && categoryIds.length > 0) {
    await prisma.contentCategory.createMany({
      data: categoryIds.map((categoryId) => ({
        contentId: created.id,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }

  const full = await prisma.content.findUnique({
    where: { id: created.id },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  return NextResponse.json(full, { status: 201 });
}
