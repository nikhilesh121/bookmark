import { NextResponse } from "next/server";

import { listPublicContent } from "@/lib/contentService";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const typeParam = searchParams.get("type");

  if (typeParam !== "MANGA" && typeParam !== "ANIME" && typeParam !== "MOVIE") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const categorySlug = searchParams.get("category") || undefined;
  const search = searchParams.get("q") || undefined;
  const sortParam = searchParams.get("sort");
  const sort = sortParam === "az" || sortParam === "views" ? sortParam : "new";

  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "24");

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100
      ? pageSize
      : 24;

  const data = await listPublicContent({
    type: typeParam,
    categorySlug,
    search,
    sort,
    page: safePage,
    pageSize: safePageSize,
  });

  return NextResponse.json(data);
}
