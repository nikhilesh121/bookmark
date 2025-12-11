import { NextResponse } from "next/server";

import { incrementContentClick } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: {
    slug: string;
  };
};

export async function GET(request: Request, { params }: RouteParams) {
  const content = await prisma.content.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      externalUrl: true,
      status: true,
    },
  });

  if (!content || content.status !== "PUBLISHED") {
    const fallbackUrl = new URL("/", request.url);
    return NextResponse.redirect(fallbackUrl);
  }

  await incrementContentClick(content.id);

  return NextResponse.redirect(content.externalUrl);
}
