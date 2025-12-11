import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth";
import { ContentPageClient } from "./ContentPageClient";

export default async function AdminContentPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <ContentPageClient />;
}
