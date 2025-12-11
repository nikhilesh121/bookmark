import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth";
import { SettingsPageClient } from "./SettingsPageClient";

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <SettingsPageClient />;
}
