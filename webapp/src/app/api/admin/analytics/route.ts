import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth";
import { getAnalyticsOverview } from "@/lib/analytics";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const daysParam = url.searchParams.get("days");
  const parsed = Number(daysParam ?? "7");
  const days = Number.isFinite(parsed) ? parsed : 7;

  const overview = await getAnalyticsOverview(days);

  return NextResponse.json(overview);
}
