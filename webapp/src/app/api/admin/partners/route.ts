import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partners = await prisma.partner.findMany({
    orderBy: [{ priorityScore: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: { links: true },
      },
    },
  });

  return NextResponse.json(partners);
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, websiteUrl, logoUrl, isVerified, priorityScore, description } = body;

  if (!name || !websiteUrl) {
    return NextResponse.json(
      { error: "Name and website URL are required" },
      { status: 400 }
    );
  }

  const slug = slugify(name);

  const existingPartner = await prisma.partner.findUnique({
    where: { slug },
  });

  if (existingPartner) {
    return NextResponse.json(
      { error: "A partner with this name already exists" },
      { status: 400 }
    );
  }

  const partner = await prisma.partner.create({
    data: {
      name,
      slug,
      websiteUrl,
      logoUrl: logoUrl || null,
      isVerified: isVerified || false,
      priorityScore: priorityScore || 0,
      description: description || null,
    },
  });

  return NextResponse.json(partner, { status: 201 });
}
