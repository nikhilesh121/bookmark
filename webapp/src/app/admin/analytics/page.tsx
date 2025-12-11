import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth";
import { AnalyticsPageClient } from "./AnalyticsPageClient";

export default async function AdminAnalyticsPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <AnalyticsPageClient />;
}
