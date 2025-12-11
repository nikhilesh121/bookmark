import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const ad = await prisma.ad.findUnique({
    where: { id },
  });

  if (!ad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(ad);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
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

  const existing = await prisma.ad.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nextType = type ?? existing.type;

  if (nextType !== "IMAGE" && nextType !== "SCRIPT") {
    return NextResponse.json(
      { error: "type must be IMAGE or SCRIPT" },
      { status: 400 },
    );
  }

  const updated = await prisma.ad.update({
    where: { id },
    data: {
      position: position ?? existing.position,
      type: nextType,
      imageUrl:
        typeof imageUrl === "undefined" ? existing.imageUrl : imageUrl,
      scriptCode:
        typeof scriptCode === "undefined" ? existing.scriptCode : scriptCode,
      targetUrl:
        typeof targetUrl === "undefined" ? existing.targetUrl : targetUrl,
      isActive:
        typeof isActive === "boolean" ? isActive : existing.isActive,
      startDate:
        typeof startDate === "undefined"
          ? existing.startDate
          : startDate
          ? new Date(startDate)
          : null,
      endDate:
        typeof endDate === "undefined"
          ? existing.endDate
          : endDate
          ? new Date(endDate)
          : null,
      sortOrder:
        typeof sortOrder === "number" ? sortOrder : existing.sortOrder,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.ad.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
