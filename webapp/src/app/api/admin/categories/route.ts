import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  return NextResponse.json(categories);
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

  const { name, typeScope, sortOrder } = body as {
    name?: string;
    typeScope?: "MANGA" | "ANIME" | "MOVIE" | "UNIVERSAL";
    sortOrder?: number;
  };

  if (!name || !typeScope) {
    return NextResponse.json(
      { error: "name and typeScope are required" },
      { status: 400 }
    );
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;

  // ensure unique slug
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      typeScope,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
