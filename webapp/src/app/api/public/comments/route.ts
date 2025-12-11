import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function removeUrls(text: string): string {
  const urlPattern = /(?:https?:\/\/|www\.)[^\s]+|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;
  return text.replace(urlPattern, '').replace(/\s+/g, ' ').trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contentSlug = searchParams.get("slug");

  if (!contentSlug) {
    return NextResponse.json(
      { error: "Content slug is required" },
      { status: 400 }
    );
  }

  const content = await prisma.content.findUnique({
    where: { slug: contentSlug },
    select: { id: true },
  });

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: {
      contentId: content.id,
      parentId: null,
      status: "APPROVED",
    },
    include: {
      replies: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" },
        include: {
          replies: {
            where: { status: "APPROVED" },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentSlug, parentId, name, email, body: commentBody } = body;

    if (!contentSlug || !name || !email || !commentBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (commentBody.length < 2 || commentBody.length > 2000) {
      return NextResponse.json(
        { error: "Comment must be between 2 and 2000 characters" },
        { status: 400 }
      );
    }

    const content = await prisma.content.findUnique({
      where: { slug: contentSlug },
      select: { id: true },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, contentId: true },
      });
      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
      if (parentComment.contentId !== content.id) {
        return NextResponse.json(
          { error: "Parent comment does not belong to this content" },
          { status: 400 }
        );
      }
    }

    const cleanedBody = removeUrls(commentBody.trim());
    
    if (cleanedBody.length < 2) {
      return NextResponse.json(
        { error: "Comment must contain at least 2 characters (URLs are not allowed)" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        contentId: content.id,
        parentId: parentId || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        body: cleanedBody,
        status: "APPROVED",
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
