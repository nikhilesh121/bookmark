"use client";

import { useState } from "react";

interface CommentFormProps {
  contentSlug: string;
  parentId?: number;
  onCommentAdded: () => void;
  onCancel?: () => void;
  isReply?: boolean;
}

export function CommentForm({
  contentSlug,
  parentId,
  onCommentAdded,
  onCancel,
  isReply = false,
}: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !body.trim()) {
      setError("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/public/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentSlug,
          parentId,
          name: name.trim(),
          email: email.trim(),
          body: body.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post comment");
      }

      setName("");
      setEmail("");
      setBody("");
      onCommentAdded();
      if (onCancel) onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${isReply ? "pl-4 border-l-2 border-zinc-200 dark:border-zinc-600" : ""}`}>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={`name-${parentId || "main"}`} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              id={`name-${parentId || "main"}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="Your name"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor={`email-${parentId || "main"}`} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              id={`email-${parentId || "main"}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="your@email.com"
              maxLength={254}
            />
          </div>
        </div>
        <div>
          <label htmlFor={`body-${parentId || "main"}`} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {isReply ? "Reply *" : "Comment *"}
          </label>
          <textarea
            id={`body-${parentId || "main"}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={isReply ? 2 : 3}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
            placeholder={isReply ? "Write your reply..." : "Write your comment..."}
            maxLength={2000}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </>
            ) : (
              isReply ? "Reply" : "Post Comment"
            )}
          </button>
          {isReply && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-700 dark:text-zinc-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Your email will not be displayed publicly.
        </p>
      </div>
    </form>
  );
}
