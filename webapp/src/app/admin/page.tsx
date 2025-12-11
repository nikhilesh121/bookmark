import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminHomePage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">
        Welcome, {admin.name}
      </h2>
      <p className="text-sm text-zinc-400">
        Role: {admin.role}
      </p>
      <p className="text-sm text-zinc-300">
        This is your admin dashboard. In the next steps we will add content,
        category, ads, and analytics management here.
      </p>
    </div>
  );
}
