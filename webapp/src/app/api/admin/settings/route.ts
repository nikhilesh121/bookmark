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
    bannerTitle,
    bannerSubtitle,
    bannerDescription,
    bannerBgColor,
    bannerBgImage,
    bannerTextColor,
    bannerBtn1Text,
    bannerBtn1Link,
    bannerBtn1Color,
    bannerBtn2Text,
    bannerBtn2Link,
    bannerBtn2Color,
    headerBgColor,
    headerTextColor,
    footerBgColor,
    footerTextColor,
    footerDescription,
  } = body as Record<string, string | null | undefined>;

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
      bannerTitle:
        typeof bannerTitle === "undefined" ? current.bannerTitle : bannerTitle,
      bannerSubtitle:
        typeof bannerSubtitle === "undefined"
          ? current.bannerSubtitle
          : bannerSubtitle,
      bannerDescription:
        typeof bannerDescription === "undefined"
          ? current.bannerDescription
          : bannerDescription,
      bannerBgColor:
        typeof bannerBgColor === "undefined"
          ? current.bannerBgColor
          : bannerBgColor,
      bannerBgImage:
        typeof bannerBgImage === "undefined"
          ? current.bannerBgImage
          : bannerBgImage,
      bannerTextColor:
        typeof bannerTextColor === "undefined"
          ? current.bannerTextColor
          : bannerTextColor,
      bannerBtn1Text:
        typeof bannerBtn1Text === "undefined"
          ? current.bannerBtn1Text
          : bannerBtn1Text,
      bannerBtn1Link:
        typeof bannerBtn1Link === "undefined"
          ? current.bannerBtn1Link
          : bannerBtn1Link,
      bannerBtn1Color:
        typeof bannerBtn1Color === "undefined"
          ? current.bannerBtn1Color
          : bannerBtn1Color,
      bannerBtn2Text:
        typeof bannerBtn2Text === "undefined"
          ? current.bannerBtn2Text
          : bannerBtn2Text,
      bannerBtn2Link:
        typeof bannerBtn2Link === "undefined"
          ? current.bannerBtn2Link
          : bannerBtn2Link,
      bannerBtn2Color:
        typeof bannerBtn2Color === "undefined"
          ? current.bannerBtn2Color
          : bannerBtn2Color,
      headerBgColor:
        typeof headerBgColor === "undefined"
          ? current.headerBgColor
          : headerBgColor,
      headerTextColor:
        typeof headerTextColor === "undefined"
          ? current.headerTextColor
          : headerTextColor,
      footerBgColor:
        typeof footerBgColor === "undefined"
          ? current.footerBgColor
          : footerBgColor,
      footerTextColor:
        typeof footerTextColor === "undefined"
          ? current.footerTextColor
          : footerTextColor,
      footerDescription:
        typeof footerDescription === "undefined"
          ? current.footerDescription
          : footerDescription,
    },
  });

  return NextResponse.json(updated);
}
