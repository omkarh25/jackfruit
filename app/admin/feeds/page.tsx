"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { uploadFile } from "@/lib/storage";
import { LOGGER } from "@/lib/logger";

interface FeedPost {
  id: string;
  title: string;
  description: string;
  mediaType: "text" | "image" | "video";
  mediaUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  totalLikes: number;
  totalShares: number;
  visibility: "public" | "members" | "service";
  createdByAdminName: string;
}

type Tab = "posts" | "create" | "analytics";

const TABS: { value: Tab; label: string }[] = [
  { value: "posts", label: "Feed Posts" },
  { value: "create", label: "Create Feed Post" },
  { value: "analytics", label: "Feed Analytics" },
];

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(value: string | Date | { seconds?: number; toMillis?: () => number }): string {
  if (!value) return "—";
  let date: Date;
  if (typeof value === "string") {
    date = new Date(value);
  } else if (value instanceof Date) {
    date = value;
  } else if ("toMillis" in value && typeof value.toMillis === "function") {
    date = new Date(value.toMillis());
  } else if ("seconds" in value && typeof value.seconds === "number") {
    date = new Date(value.seconds * 1000);
  } else {
    return "—";
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminFeedsPage() {
  const { firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalShares: 0,
    topPosts: [] as { id?: string; title: string; totalLikes: number; totalShares: number }[],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Form state
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<"text" | "image" | "video">("text");
  const [mediaUrl, setMediaUrl] = useState("");
  const [visibility, setVisibility] = useState<"public" | "members" | "service">("public");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPosts();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  async function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
    const token = await firebaseUser?.getIdToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function loadPosts() {
    setPostsLoading(true);
    try {
      const res = await fetchWithAuth("/api/admin/feed/posts");
      const data = await res.json();
      if (res.ok) setPosts(data.posts || []);
    } catch (e) {
      LOGGER.error("Failed to load feed posts", { error: String(e) });
      showMessage("Failed to load feed posts", "error");
    } finally {
      setPostsLoading(false);
    }
  }

  async function loadAnalytics() {
    setAnalyticsLoading(true);
    try {
      const res = await fetchWithAuth("/api/admin/feed/analytics");
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (e) {
      LOGGER.error("Failed to load feed analytics", { error: String(e) });
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage("File size must be under 20 MB", "error");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `feed/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const url = await uploadFile(file, path);
      setMediaUrl(url);
      if (file.type.startsWith("video/")) setMediaType("video");
      else if (file.type.startsWith("image/")) setMediaType("image");
      showMessage("Media uploaded", "success");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setMediaType("text");
    setMediaUrl("");
    setVisibility("public");
    setEditingPost(null);
  }

  function openEdit(post: FeedPost) {
    setEditingPost(post);
    setTitle(post.title);
    setDescription(post.description);
    setMediaType(post.mediaType);
    setMediaUrl(post.mediaUrl || "");
    setVisibility(post.visibility);
    setActiveTab("create");
  }

  async function handleSave() {
    if (!title.trim() || !description.trim()) {
      showMessage("Title and description are required", "error");
      return;
    }

    if ((mediaType === "image" || mediaType === "video") && !mediaUrl.trim()) {
      showMessage("Please upload or enter a media URL", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editingPost
        ? `/api/admin/feed/posts/${editingPost.id}`
        : "/api/admin/feed/posts";
      const method = editingPost ? "PATCH" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          mediaType,
          mediaUrl: mediaType === "text" ? undefined : mediaUrl.trim(),
          visibility,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save post");

      showMessage(editingPost ? "Post updated" : "Post published", "success");
      resetForm();
      loadPosts();
      loadAnalytics();
      setActiveTab("posts");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to save post", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post: FeedPost) {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    try {
      const res = await fetchWithAuth(`/api/admin/feed/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      showMessage("Post deleted", "success");
      loadPosts();
      loadAnalytics();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to delete post", "error");
    }
  }

  const filteredPosts = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminShell title="Feed Management" subtitle="Create, edit, and analyze feed posts">
      {message && (
        <div
          className={classNames(
            "mb-4 rounded-xl px-5 py-3 text-sm font-medium",
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6 flex space-x-1 rounded-xl bg-white p-1 shadow-soft">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={classNames(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition",
              activeTab === tab.value
                ? "bg-tattvam-purple-600 text-white"
                : "text-tattvam-purple-600 hover:bg-tattvam-purple-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "posts" && (
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Feed Posts</h2>
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
            />
          </div>

          {postsLoading ? (
            <div className="py-12 text-center text-tattvam-purple-400">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-tattvam-purple-400">No posts found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
              <table className="w-full min-w-[768px] text-left text-sm">
                <thead className="bg-tattvam-purple-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Media</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Title</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Type</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Created</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Likes</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Shares</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Status</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((p) => (
                    <tr key={p.id} className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50">
                      <td className="px-4 py-3">
                        {p.mediaUrl && p.mediaType === "image" ? (
                          <img src={p.mediaUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : p.mediaUrl && p.mediaType === "video" ? (
                          <span className="rounded-lg bg-tattvam-purple-100 px-2 py-1 text-xs text-tattvam-purple-600">Video</span>
                        ) : (
                          <span className="text-xs text-tattvam-purple-400">Text</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-tattvam-purple-800">{p.title}</td>
                      <td className="px-4 py-3 text-tattvam-purple-600 capitalize">{p.mediaType}</td>
                      <td className="px-4 py-3 text-tattvam-purple-600">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3 text-tattvam-purple-600">{p.totalLikes || 0}</td>
                      <td className="px-4 py-3 text-tattvam-purple-600">{p.totalShares || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={classNames(
                            "rounded-full px-2.5 py-1 text-xs font-bold",
                            p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {p.isActive ? "Active" : "Deleted"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "create" && (
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-serif text-xl font-bold text-tattvam-purple-900">
            {editingPost ? "Edit Feed Post" : "Create Feed Post"}
          </h2>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Post content"
                className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Media Type</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as "text" | "image" | "video")}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                >
                  <option value="text">Text only</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "public" | "members" | "service")}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                >
                  <option value="public">Public</option>
                  <option value="members">Members Only</option>
                  <option value="service">Service Specific</option>
                </select>
              </div>
            </div>

            {mediaType !== "text" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Media</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    accept={mediaType === "image" ? "image/*" : "video/*"}
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="text-sm"
                  />
                  <span className="text-xs text-tattvam-purple-500">or</span>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Paste media URL"
                    className="flex-1 rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                {uploading && <p className="mt-2 text-xs text-tattvam-purple-500">Uploading…</p>}
                {mediaUrl && (
                  <div className="mt-3">
                    {mediaType === "image" ? (
                      <img src={mediaUrl} alt="Preview" className="h-32 rounded-xl object-cover" />
                    ) : (
                      <video src={mediaUrl} controls className="h-32 rounded-xl" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                resetForm();
                setActiveTab("posts");
              }}
              className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="btn-primary text-sm disabled:opacity-60"
            >
              {saving ? "Saving…" : editingPost ? "Update Post" : "Publish Post"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="mb-4 font-serif text-xl font-bold text-tattvam-purple-900">Feed Analytics</h2>
            {analyticsLoading ? (
              <div className="py-12 text-center text-tattvam-purple-400">Loading analytics...</div>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { label: "Total Posts", value: analytics.totalPosts, color: "text-tattvam-purple-800" },
                    { label: "Total Likes", value: analytics.totalLikes, color: "text-pink-700" },
                    { label: "Total Shares", value: analytics.totalShares, color: "text-tattvam-purple-700" },
                  ].map((card) => (
                    <div key={card.label} className="rounded-xl bg-tattvam-purple-50 p-6 text-center">
                      <p className={classNames("text-3xl font-bold", card.color)}>{card.value}</p>
                      <p className="text-sm text-tattvam-purple-600">{card.label}</p>
                    </div>
                  ))}
                </div>

                <h3 className="mb-3 font-semibold text-tattvam-purple-800">Top Posts</h3>
                {analytics.topPosts.length === 0 ? (
                  <div className="py-8 text-center text-tattvam-purple-400">No posts yet.</div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-tattvam-purple-50">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Title</th>
                          <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Likes</th>
                          <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Shares</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topPosts.map((p) => (
                          <tr key={p.id} className="border-b border-tattvam-purple-50">
                            <td className="px-4 py-3 font-medium text-tattvam-purple-800">{p.title}</td>
                            <td className="px-4 py-3 text-tattvam-purple-600">{p.totalLikes}</td>
                            <td className="px-4 py-3 text-tattvam-purple-600">{p.totalShares}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
