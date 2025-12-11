import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { contentId, reason, details } = body;

  if (!contentId || !reason) {
    return NextResponse.json(
      { error: "Content ID and reason are required" },
      { status: 400 }
    );
  }

  const content = await prisma.content.findUnique({
    where: { id: Number(contentId) },
  });

  if (!content) {
    return NextResponse.json(
      { error: "Content not found" },
      { status: 404 }
    );
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const reporterIp = forwardedFor?.split(",")[0] || realIp || null;

  const report = await prisma.contentReport.create({
    data: {
      contentId: Number(contentId),
      reason,
      details: details || null,
      reporterIp,
    },
  });

  return NextResponse.json({ success: true, reportId: report.id }, { status: 201 });
}
