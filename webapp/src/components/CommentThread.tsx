"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";

interface Comment {
  id: number;
  name: string;
  body: string;
  createdAt: string;
  replies: Comment[];
}

interface CommentThreadProps {
  comment: Comment;
  contentSlug: string;
  onReplyAdded: () => void;
  depth?: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function CommentThread({
  comment,
  contentSlug,
  onReplyAdded,
  depth = 0,
}: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const maxDepth = 2;

  return (
    <div className={`${depth > 0 ? "ml-4 sm:ml-8 pl-4 border-l-2 border-zinc-200 dark:border-zinc-600" : ""}`}>
      <div className="flex gap-3">
        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium ${getAvatarColor(comment.name)}`}>
          {getInitials(comment.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-zinc-900 dark:text-white text-sm">
              {comment.name}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
            {comment.body}
          </p>
          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              {showReplyForm ? "Cancel" : "Reply"}
            </button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-3 ml-11 sm:ml-13">
          <CommentForm
            contentSlug={contentSlug}
            parentId={comment.id}
            onCommentAdded={onReplyAdded}
            onCancel={() => setShowReplyForm(false)}
            isReply
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              contentSlug={contentSlug}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
