import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contentId = searchParams.get("contentId");
  const slug = searchParams.get("slug");

  if (!contentId && !slug) {
    return NextResponse.json(
      { error: "Content ID or slug is required" },
      { status: 400 }
    );
  }

  let content;
  if (slug) {
    content = await prisma.content.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
  }

  const targetContentId = contentId ? Number(contentId) : content!.id;

  const links = await prisma.contentLink.findMany({
    where: {
      contentId: targetContentId,
      status: "VERIFIED",
    },
    include: {
      partner: {
        select: { id: true, name: true, isVerified: true, logoUrl: true },
      },
    },
    orderBy: [
      { priority: "desc" },
      { partner: { priorityScore: "desc" } },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(links);
}
