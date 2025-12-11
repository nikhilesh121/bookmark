"use client";

import { useState, useEffect } from "react";
import { AdSlot } from "./AdSlot";

type RedirectPageProps = {
  title: string;
  targetUrl: string;
  sourceName: string;
};

export function RedirectPage({ title, targetUrl, sourceName }: RedirectPageProps) {
  const [countdown, setCountdown] = useState(3);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!redirecting) {
      setRedirecting(true);
      window.location.href = targetUrl;
    }
  }, [countdown, redirecting, targetUrl]);

  function handleSkip() {
    setRedirecting(true);
    window.location.href = targetUrl;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Redirecting...
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              You are being redirected to <strong className="text-zinc-800 dark:text-zinc-200">{sourceName}</strong>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-6 truncate">
              {title}
            </p>

            <div className="mb-6">
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                Redirecting in <span className="font-bold text-indigo-600 dark:text-indigo-400">{countdown}</span> seconds...
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Go Now
              </button>
              <a
                href="/"
                className="flex-1 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
              >
                Cancel
              </a>
            </div>

            <p className="text-[10px] text-zinc-400 mt-4">
              By continuing, you will leave our site and go to an external website.
            </p>
          </div>

          <div className="mt-6">
            <AdSlot position="redirect_page" />
          </div>
        </div>
      </div>

      <footer className="py-4 text-center">
        <p className="text-xs text-zinc-500">
          Safe redirect powered by Bookmark
        </p>
      </footer>
    </div>
  );
}
