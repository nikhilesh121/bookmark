import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Admin</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/admin/content" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              Content
            </Link>
            <Link href="/admin/links" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              Links
            </Link>
            <Link href="/admin/categories" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              Categories
            </Link>
            <Link href="/admin/partners" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              Partners
            </Link>
            <Link href="/admin/reports" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              Reports
            </Link>
            <Link href="/admin/ads" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              Ads
            </Link>
            <Link href="/admin/analytics" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              Analytics
            </Link>
            <Link href="/admin/settings" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Site
            </Link>
          </div>
        </div>
        <nav className="flex md:hidden items-center justify-center gap-1 py-2 border-t border-slate-700/50 overflow-x-auto px-4">
          <Link href="/admin/content" className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors whitespace-nowrap">
            Content
          </Link>
          <Link href="/admin/links" className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors whitespace-nowrap">
            Links
          </Link>
          <Link href="/admin/categories" className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors whitespace-nowrap">
            Categories
          </Link>
          <Link href="/admin/partners" className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors whitespace-nowrap">
            Partners
          </Link>
          <Link href="/admin/reports" className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors whitespace-nowrap">
            Reports
          </Link>
          <Link href="/admin/ads" className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors whitespace-nowrap">
            Ads
          </Link>
          <Link href="/admin/analytics" className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors whitespace-nowrap">
            Analytics
          </Link>
          <Link href="/admin/settings" className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors whitespace-nowrap">
            Settings
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
