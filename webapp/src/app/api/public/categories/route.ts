import { NextResponse } from "next/server";

import { listPublicCategoriesForType } from "@/lib/contentService";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const typeParam = url.searchParams.get("type");

  if (typeParam !== "MANGA" && typeParam !== "ANIME" && typeParam !== "MOVIE") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const categories = await listPublicCategoriesForType(typeParam);

  return NextResponse.json(categories);
}
