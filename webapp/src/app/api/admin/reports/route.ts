import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status ? { status: status as "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED" } : {};

  const reports = await prisma.contentReport.findMany({
    where,
    include: {
      content: {
        select: { id: true, title: true, slug: true, type: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}
