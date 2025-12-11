import { NextResponse } from "next/server";

import { incrementContentClick, incrementContentView } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { contentId, event } = body as {
    contentId?: number;
    event?: "view" | "click";
  };

  if (!contentId || (event !== "view" && event !== "click")) {
    return NextResponse.json(
      { error: "contentId and event (view|click) are required" },
      { status: 400 },
    );
  }

  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!content || content.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (event === "view") {
    await incrementContentView(content.id);
  } else {
    await incrementContentClick(content.id);
  }

  return NextResponse.json({ ok: true });
}
