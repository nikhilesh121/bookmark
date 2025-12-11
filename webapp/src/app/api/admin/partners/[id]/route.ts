import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const partner = await prisma.partner.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: { links: true },
      },
    },
  });

  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  return NextResponse.json(partner);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, websiteUrl, logoUrl, isVerified, priorityScore, description } = body;

  const updateData: Record<string, unknown> = {};

  if (name !== undefined) {
    updateData.name = name;
    updateData.slug = slugify(name);
  }
  if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
  if (isVerified !== undefined) updateData.isVerified = isVerified;
  if (priorityScore !== undefined) updateData.priorityScore = priorityScore;
  if (description !== undefined) updateData.description = description;

  const partner = await prisma.partner.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      _count: {
        select: { links: true },
      },
    },
  });

  return NextResponse.json(partner);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.partner.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
