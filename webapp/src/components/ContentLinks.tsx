"use client";

import Link from "next/link";

type ContentLink = {
  id: number;
  url: string;
  sourceName: string;
  linkType: "READ" | "WATCH" | "DOWNLOAD" | "VISIT" | "MIRROR" | "EXTERNAL";
  partner: {
    id: number;
    name: string;
    isVerified: boolean;
    logoUrl: string | null;
  } | null;
};

type ContentLinksProps = {
  links: ContentLink[];
  contentSlug: string;
  contentType: string;
  fallbackUrl: string;
};

const linkTypeLabels: Record<string, { label: string; icon: string }> = {
  READ: { label: "Read", icon: "📖" },
  WATCH: { label: "Watch", icon: "▶️" },
  DOWNLOAD: { label: "Download", icon: "⬇️" },
  VISIT: { label: "Visit", icon: "🔗" },
  MIRROR: { label: "Mirror", icon: "🪞" },
  EXTERNAL: { label: "External", icon: "🌐" },
};

export function ContentLinks({ links, contentSlug, contentType, fallbackUrl }: ContentLinksProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No verified sources available yet.
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          Check back later for updated links.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {links.map((link) => {
        const typeInfo = linkTypeLabels[link.linkType] || { label: link.linkType, icon: "🔗" };
        
        return (
          <Link
            key={link.id}
            href={`/redirect/${contentSlug}/${link.id}`}
            className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              {link.partner?.logoUrl ? (
                <img
                  src={link.partner.logoUrl}
                  alt={link.partner.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <span className="text-lg">{typeInfo.icon}</span>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {link.sourceName}
                  </span>
                  {link.partner?.isVerified && (
                    <span className="text-green-500 text-xs" title="Verified Partner">✓</span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {typeInfo.label}
                </span>
              </div>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        );
      })}
    </div>
  );
}
