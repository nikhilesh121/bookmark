"use client";

import { useState, useEffect } from "react";
import { CommentForm } from "./CommentForm";
import { CommentThread } from "./CommentThread";

interface Comment {
  id: number;
  name: string;
  body: string;
  createdAt: string;
  replies: Comment[];
}

interface CommentSectionProps {
  contentSlug: string;
}

export function CommentSection({ contentSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/public/comments?slug=${contentSlug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [contentSlug]);

  const handleCommentAdded = () => {
    fetchComments();
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments ({comments.length})
      </h3>

      <CommentForm 
        contentSlug={contentSlug} 
        onCommentAdded={handleCommentAdded} 
      />

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                contentSlug={contentSlug}
                onReplyAdded={handleCommentAdded}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
