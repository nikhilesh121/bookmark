"use client";

import { useState } from "react";

type ContentActionsProps = {
  contentId: number;
  contentSlug: string;
  title: string;
};

export function ContentActions({ contentId, contentSlug, title }: ContentActionsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title,
        url: shareUrl,
      }).catch(() => {});
    } else {
      setShowShareMenu(!showShareMenu);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Link copied to clipboard!");
      setShowShareMenu(false);
    }).catch(() => {
      alert("Failed to copy link");
    });
  }

  function openReportModal() {
    const event = new CustomEvent("openReportModal", { detail: { contentId } });
    window.dispatchEvent(event);
  }

  async function handleBookmark() {
    setBookmarkLoading(true);
    setIsBookmarked(!isBookmarked);
    setBookmarkLoading(false);
  }

  return (
    <div className="flex items-center gap-2 relative">
      <button
        onClick={handleBookmark}
        disabled={bookmarkLoading}
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ${isBookmarked ? "text-yellow-500 fill-yellow-500" : "text-zinc-500 dark:text-zinc-400"}`}
          fill={isBookmarked ? "currentColor" : "none"}
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>

      <button
        onClick={handleShare}
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        title="Share"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      <button
        onClick={openReportModal}
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        title="Report"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </button>

      {showShareMenu && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 min-w-[150px] z-50">
          <button
            onClick={copyToClipboard}
            className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Copy Link
          </button>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Share on X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Share on Facebook
          </a>
        </div>
      )}
    </div>
  );
}
