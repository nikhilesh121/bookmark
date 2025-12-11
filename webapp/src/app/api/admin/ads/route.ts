import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ads = await prisma.ad.findMany({
    orderBy: [
      { position: "asc" },
      { sortOrder: "asc" },
      { id: "asc" },
    ],
  });

  return NextResponse.json(ads);
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    position,
    type,
    imageUrl,
    scriptCode,
    targetUrl,
    isActive,
    startDate,
    endDate,
    sortOrder,
  } = body as {
    position?: string;
    type?: "IMAGE" | "SCRIPT";
    imageUrl?: string | null;
    scriptCode?: string | null;
    targetUrl?: string | null;
    isActive?: boolean;
    startDate?: string | null;
    endDate?: string | null;
    sortOrder?: number;
  };

  if (!position || (type !== "IMAGE" && type !== "SCRIPT")) {
    return NextResponse.json(
      { error: "position and type (IMAGE|SCRIPT) are required" },
      { status: 400 },
    );
  }

  const active = typeof isActive === "boolean" ? isActive : true;

  const created = await prisma.ad.create({
    data: {
      position,
      type,
      imageUrl: imageUrl ?? null,
      scriptCode: scriptCode ?? null,
      targetUrl: targetUrl ?? null,
      isActive: active,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
