"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/app-shell/page-shell";
import { FeedCard, type FeedPost } from "@/components/feed/feed-card";
import { useAuth } from "@/components/auth/auth-provider";
import { LOGGER } from "@/lib/logger";

export default function FeedsPage() {
  const { firebaseUser } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  async function loadPosts() {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      const token = await firebaseUser?.getIdToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/feed/posts", { headers });
      const data = await res.json();
      if (res.ok) setPosts(data.posts || []);
    } catch (e) {
      LOGGER.error("Failed to load feed posts", { error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId: string) {
    const token = await firebaseUser?.getIdToken();
    const res = await fetch(`/api/feed/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Like failed");
  }

  async function handleShare(postId: string) {
    const token = await firebaseUser?.getIdToken();
    await fetch(`/api/feed/posts/${postId}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shareMethod: "copy_link" }),
    });
  }

  return (
    <PageShell
      eyebrow="Feeds"
      title="Updates curated for your wellness journey"
      description="See announcements, learning resources, workshop reminders, and booking prompts in one place."
    >
      <div className="grid gap-5">
        {loading ? (
          <div className="py-12 text-center text-tattvam-purple-400">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
            <p className="text-lg text-tattvam-purple-400">No updates yet.</p>
            <p className="mt-2 text-sm text-tattvam-purple-400">Check back soon for wellness tips and announcements.</p>
          </div>
        ) : (
          posts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/feeds`}
              onLike={handleLike}
              onShare={handleShare}
              isLoggedIn={!!firebaseUser}
            />
          ))
        )}
      </div>
    </PageShell>
  );
}
