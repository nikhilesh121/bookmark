import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth";
import { AdsPageClient } from "./AdsPageClient";

export default async function AdminAdsPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <AdsPageClient />;
}
