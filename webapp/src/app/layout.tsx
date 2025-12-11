import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getOrCreateSiteSettings } from "@/lib/settings";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bookmark",
  description: "Directory of Manga, Anime, and Movies",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getOrCreateSiteSettings();
  const gaId = settings.googleAnalyticsId ?? undefined;

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 glass-effect border-b border-zinc-200/50 dark:border-zinc-700/50">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/" className="flex items-center gap-2">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt={settings.siteName}
                      className="h-8 w-auto"
                    />
                  ) : (
                    <span className="text-xl font-bold gradient-text">{settings.siteName}</span>
                  )}
                </Link>
                <nav className="hidden items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:flex">
                  <Link href="/manga" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
                    Manga
                  </Link>
                  <Link href="/anime" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
                    Anime
                  </Link>
                  <Link href="/movies" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
                    Movies
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
            <nav className="flex sm:hidden items-center justify-center gap-6 py-2 border-t border-zinc-100 dark:border-zinc-700/50 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link href="/manga" className="hover:text-zinc-900 dark:hover:text-white">Manga</Link>
              <Link href="/anime" className="hover:text-zinc-900 dark:hover:text-white">Anime</Link>
              <Link href="/movies" className="hover:text-zinc-900 dark:hover:text-white">Movies</Link>
            </nav>
            {settings.headerAdHtml && (
              <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <div
                  className="mx-auto max-w-7xl px-3 py-2 sm:px-4"
                  dangerouslySetInnerHTML={{ __html: settings.headerAdHtml }}
                />
              </div>
            )}
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="mt-8 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            {settings.footerAdHtml && (
              <div className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <div
                  className="mx-auto max-w-7xl px-3 py-3 sm:px-4"
                  dangerouslySetInnerHTML={{ __html: settings.footerAdHtml }}
                />
              </div>
            )}
            <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div className="col-span-2">
                  <span className="text-lg font-bold gradient-text">{settings.siteName}</span>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                    Your ultimate destination for discovering the best manga, anime, and movies.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-2">Browse</h4>
                  <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <li><Link href="/manga" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Manga</Link></li>
                    <li><Link href="/anime" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Anime</Link></li>
                    <li><Link href="/movies" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Movies</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-2">Info</h4>
                  <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <li><span>&copy; {new Date().getFullYear()} {settings.siteName}</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        </div>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-setup" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
