"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  content: {
    id: number;
    title: string;
    slug: string;
  };
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editStatus, setEditStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("APPROVED");

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (filter) params.set("status", filter);
      
      const res = await fetch(`/api/admin/comments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, filter]);

  const handleSelectAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comments.map((c) => c.id));
    }
  };

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} comment(s)?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to delete comments:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkStatus = async (status: "APPROVED" | "REJECTED") => {
    if (selectedIds.length === 0) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to update comments:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditBody(comment.body);
    setEditStatus(comment.status);
  };

  const handleSaveEdit = async () => {
    if (!editingComment) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ids: [editingComment.id], 
          status: editStatus,
          body: editBody 
        }),
      });
      if (res.ok) {
        setEditingComment(null);
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditBody("");
    setEditStatus("APPROVED");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10",
      APPROVED: "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10",
      REJECTED: "bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10",
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Comments Management
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Review, moderate, and manage user comments
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white text-sm font-medium shadow-lg shadow-slate-900/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-2xl border border-indigo-500/30 backdrop-blur-sm shadow-xl shadow-indigo-500/5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-300">{selectedIds.length}</span>
              </div>
              <span className="text-sm text-slate-300 font-medium">selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus("APPROVED")}
                disabled={actionLoading}
                className="group px-4 py-2 text-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              <button
                onClick={() => handleBulkStatus("REJECTED")}
                disabled={actionLoading}
                className="px-4 py-2 text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Reject
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={actionLoading}
                className="px-4 py-2 text-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {editingComment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl max-w-2xl w-full p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Comment</h2>
              <button onClick={handleCancelEdit} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {editingComment.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{editingComment.name}</div>
                  <div className="text-sm text-slate-400">{editingComment.email}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Comment Text</label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <div className="flex gap-3">
                  {(["PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditStatus(status)}
                      className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        editStatus === status
                          ? status === "APPROVED"
                            ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30"
                            : status === "REJECTED"
                            ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30"
                            : "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                          : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading}
                className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-3xl border border-slate-700/30">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-slate-400 text-lg">No comments found</p>
          <p className="text-slate-500 text-sm mt-1">Comments will appear here when users post them</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedIds.length === comments.length && comments.length > 0}
                  onChange={handleSelectAll}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Select all</span>
            </label>
            <span className="text-sm text-slate-500">{comments.length} comments</span>
          </div>

          <div className="grid gap-4">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`group bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 ${
                  selectedIds.includes(comment.id) 
                    ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10" 
                    : "border-slate-700/50 hover:border-slate-600/50"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(comment.id)}
                          onChange={() => handleSelect(comment.id)}
                          className="sr-only peer"
                        />
                        <div 
                          onClick={() => handleSelect(comment.id)}
                          className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all flex items-center justify-center cursor-pointer hover:border-slate-500"
                        >
                          {selectedIds.includes(comment.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{comment.name}</span>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-sm ${getStatusBadge(comment.status)}`}>
                              {comment.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{comment.email}</div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(comment)}
                            className="p-2 rounded-lg bg-slate-700/50 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-300 text-sm leading-relaxed mb-3">
                        {comment.body}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <a
                          href={`/content/${comment.content.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {comment.content.title}
                        </a>
                        <span className="text-slate-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl border border-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <div className="flex items-center gap-1 px-4">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    page === pageNum
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl border border-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
