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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
      REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Comments Management</h1>
        
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-300">
            {selectedIds.length} selected
          </span>
          <button
            onClick={() => handleBulkStatus("APPROVED")}
            disabled={actionLoading}
            className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => handleBulkStatus("REJECTED")}
            disabled={actionLoading}
            className="px-3 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={actionLoading}
            className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400">No comments found</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === comments.length && comments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded bg-slate-700 border-slate-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Comment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Content
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(comment.id)}
                      onChange={() => handleSelect(comment.id)}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white">{comment.name}</div>
                      <div className="text-xs text-slate-400">{comment.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-300 max-w-md truncate">
                      {comment.body}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/${comment.content.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      {comment.content.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(comment.status)}`}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {formatDate(comment.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
