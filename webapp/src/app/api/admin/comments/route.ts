import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || undefined;

  const where = status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {};

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        content: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);

  return NextResponse.json({
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ids } = body as { ids: number[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Comment IDs are required" },
        { status: 400 }
      );
    }

    await prisma.comment.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete comments" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ids, status, body: commentBody } = body as { 
      ids: number[]; 
      status?: "PENDING" | "APPROVED" | "REJECTED";
      body?: string;
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Comment IDs are required" },
        { status: 400 }
      );
    }

    if (ids.length === 1 && commentBody !== undefined) {
      const updateData: { status?: "PENDING" | "APPROVED" | "REJECTED"; body?: string } = {};
      if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        updateData.status = status;
      }
      if (commentBody !== undefined) {
        updateData.body = commentBody;
      }
      
      await prisma.comment.update({
        where: { id: ids[0] },
        data: updateData,
      });
      
      return NextResponse.json({ success: true, updated: 1 });
    }

    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required for bulk updates" },
        { status: 400 }
      );
    }

    await prisma.comment.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status },
    });

    return NextResponse.json({ success: true, updated: ids.length });
  } catch {
    return NextResponse.json(
      { error: "Failed to update comments" },
      { status: 500 }
    );
  }
}
