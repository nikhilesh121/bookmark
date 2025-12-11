import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const contentId = searchParams.get("contentId");

  const where = contentId ? { contentId: Number(contentId) } : {};

  const links = await prisma.contentLink.findMany({
    where,
    include: {
      partner: {
        select: { id: true, name: true, isVerified: true },
      },
      content: {
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { contentId, url, sourceName, linkType, status, priority, partnerId } = body;

  if (!contentId || !url || !sourceName || !linkType) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const link = await prisma.contentLink.create({
    data: {
      contentId: Number(contentId),
      url,
      sourceName,
      linkType,
      status: status || "UNVERIFIED",
      priority: priority || 0,
      partnerId: partnerId ? Number(partnerId) : null,
    },
    include: {
      partner: {
        select: { id: true, name: true, isVerified: true },
      },
    },
  });

  return NextResponse.json(link, { status: 201 });
}
