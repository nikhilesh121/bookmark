import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth";
import { CategoriesPageClient } from "./CategoriesPageClient";

export default async function AdminCategoriesPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <CategoriesPageClient />;
}
