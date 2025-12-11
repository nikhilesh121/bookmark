import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Admin Panel
          </h1>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-1 px-6 py-8">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
