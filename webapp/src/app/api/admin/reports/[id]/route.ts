import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

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
  const { status } = body;

  if (!status || !["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  const report = await prisma.contentReport.update({
    where: { id: Number(id) },
    data: { status },
    include: {
      content: {
        select: { id: true, title: true, slug: true, type: true },
      },
    },
  });

  return NextResponse.json(report);
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

  await prisma.contentReport.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
