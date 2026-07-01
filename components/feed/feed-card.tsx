"use client";

import { useState } from "react";
import { ShareButton } from "@/components/share-button";

export interface FeedPost {
  id: string;
  title: string;
  description: string;
  mediaType: "text" | "image" | "video";
  mediaUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  totalLikes: number;
  totalShares: number;
  isLiked?: boolean;
}

interface FeedCardProps {
  post: FeedPost;
  shareUrl: string;
  onLike: (postId: string) => Promise<void>;
  onShare: (postId: string) => Promise<void>;
  isLoggedIn: boolean;
}

function formatDate(value: string | Date | { seconds?: number; toMillis?: () => number }): string {
  if (!value) return "";
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
    return "";
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function FeedCard({ post, shareUrl, onLike, onShare, isLoggedIn }: FeedCardProps) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.totalLikes || 0);
  const [shareCount, setShareCount] = useState(post.totalShares || 0);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (!isLoggedIn || loading) return;
    setLoading(true);
    try {
      await onLike(post.id);
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    await onShare(post.id);
    setShareCount((prev) => prev + 1);
  }

  return (
    <article className="rounded-3xl border border-tattvam-purple-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="rounded-full bg-tattvam-gold-100 px-3 py-1 text-xs font-bold text-tattvam-gold-700 capitalize">
          {post.mediaType}
        </span>
        <span className="text-sm font-medium text-tattvam-purple-500">{formatDate(post.createdAt)}</span>
      </div>

      <h2 className="font-serif text-2xl font-bold text-tattvam-purple-800">{post.title}</h2>
      <p className="mt-3 whitespace-pre-wrap leading-7 text-tattvam-purple-600/70">{post.description}</p>

      {post.mediaUrl && post.mediaType === "image" && (
        <div className="mt-5 overflow-hidden rounded-2xl">
          <img
            src={post.mediaUrl}
            alt={post.title}
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {post.mediaUrl && post.mediaType === "video" && (
        <div className="mt-5 overflow-hidden rounded-2xl">
          <video
            src={post.mediaUrl}
            poster={post.thumbnailUrl}
            controls
            muted
            playsInline
            preload="metadata"
            className="w-full"
          />
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={!isLoggedIn || loading}
            className={
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition " +
              (liked
                ? "bg-pink-100 text-pink-700"
                : "bg-tattvam-purple-50 text-tattvam-purple-600 hover:bg-tattvam-purple-100")
            }
            type="button"
          >
            <span>{liked ? "❤️" : "🤍"}</span>
            <span>{likeCount}</span>
          </button>
          {!isLoggedIn && (
            <span className="text-xs text-tattvam-purple-400">Sign in to like</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-tattvam-purple-500">{shareCount} shares</span>
          <ShareButton url={shareUrl} title={post.title} onShare={handleShare} />
        </div>
      </div>
    </article>
  );
}
