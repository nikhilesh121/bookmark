import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth";
import { getOrCreateSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getOrCreateSiteSettings();

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    siteName,
    logoUrl,
    googleAnalyticsId,
    headerAdHtml,
    footerAdHtml,
  } = body as {
    siteName?: string;
    logoUrl?: string | null;
    googleAnalyticsId?: string | null;
    headerAdHtml?: string | null;
    footerAdHtml?: string | null;
  };

  const current = await getOrCreateSiteSettings();

  const updated = await prisma.siteSettings.update({
    where: { id: current.id },
    data: {
      siteName: siteName ?? current.siteName,
      logoUrl: typeof logoUrl === "undefined" ? current.logoUrl : logoUrl,
      googleAnalyticsId:
        typeof googleAnalyticsId === "undefined"
          ? current.googleAnalyticsId
          : googleAnalyticsId,
      headerAdHtml:
        typeof headerAdHtml === "undefined"
          ? current.headerAdHtml
          : headerAdHtml,
      footerAdHtml:
        typeof footerAdHtml === "undefined"
          ? current.footerAdHtml
          : footerAdHtml,
    },
  });

  return NextResponse.json(updated);
}
