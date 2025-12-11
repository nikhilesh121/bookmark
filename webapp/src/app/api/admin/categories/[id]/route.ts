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

  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(category);
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

  const { name, typeScope, sortOrder } = body as {
    name?: string;
    typeScope?: "MANGA" | "ANIME" | "MOVIE" | "UNIVERSAL";
    sortOrder?: number;
  };

  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let slug = existing.slug;

  if (name && name !== existing.name) {
    const baseSlug = slugify(name);
    slug = baseSlug;
    let counter = 2;

    // ensure unique slug
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const conflict = await prisma.category.findUnique({ where: { slug } });
      if (!conflict || conflict.id === id) break;
      slug = `${baseSlug}-${counter++}`;
    }
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      slug,
      typeScope: typeScope ?? existing.typeScope,
      sortOrder: sortOrder ?? existing.sortOrder,
    },
  });

  return NextResponse.json(updated);
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

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
