import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const item = await prisma.content.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
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

  const existing = await prisma.content.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let slug = existing.slug;

  if (title && title !== existing.title) {
    const baseSlug = slugify(title);
    slug = baseSlug;
    let counter = 2;

    // ensure unique slug
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const conflict = await prisma.content.findUnique({ where: { slug } });
      if (!conflict || conflict.id === id) break;
      slug = `${baseSlug}-${counter++}`;
    }
  }

  await prisma.content.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      slug,
      type: type ?? existing.type,
      imageUrl: imageUrl ?? existing.imageUrl,
      description: description ?? existing.description,
      externalUrl: externalUrl ?? existing.externalUrl,
      status: status ?? existing.status,
      directRedirect:
        typeof directRedirect === "boolean"
          ? directRedirect
          : existing.directRedirect,
    },
  });

  if (Array.isArray(categoryIds)) {
    await prisma.contentCategory.deleteMany({ where: { contentId: id } });

    if (categoryIds.length > 0) {
      await prisma.contentCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          contentId: id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }
  }

  const full = await prisma.content.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  return NextResponse.json(full);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.contentCategory.deleteMany({ where: { contentId: id } });
  await prisma.content.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
