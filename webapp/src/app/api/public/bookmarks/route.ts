import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: Number(userId) },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, contentId } = body;

  if (!userId || !contentId) {
    return NextResponse.json(
      { error: "User ID and Content ID are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_contentId: {
        userId: Number(userId),
        contentId: Number(contentId),
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({
    data: {
      userId: Number(userId),
      contentId: Number(contentId),
    },
  });

  return NextResponse.json({ bookmarked: true }, { status: 201 });
}
