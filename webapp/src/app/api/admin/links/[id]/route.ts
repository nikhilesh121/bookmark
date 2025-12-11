import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const link = await prisma.contentLink.findUnique({
    where: { id: Number(id) },
    include: {
      partner: {
        select: { id: true, name: true, isVerified: true },
      },
      content: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json(link);
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
  const { url, sourceName, linkType, status, priority, partnerId } = body;

  const link = await prisma.contentLink.update({
    where: { id: Number(id) },
    data: {
      url,
      sourceName,
      linkType,
      status,
      priority,
      partnerId: partnerId !== undefined ? (partnerId ? Number(partnerId) : null) : undefined,
    },
    include: {
      partner: {
        select: { id: true, name: true, isVerified: true },
      },
    },
  });

  return NextResponse.json(link);
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

  await prisma.contentLink.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
