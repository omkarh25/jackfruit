export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { createFeedPost, getAllFeedPosts, type FeedPost } from "@/lib/db/feed-posts";
import { getAdminDb } from "@/lib/firebase-admin";

export interface FeedPostsAdminResponse {
  posts: FeedPost[];
}

export interface CreateFeedPostBody {
  title: string;
  description: string;
  mediaType: "text" | "image" | "video";
  mediaUrl?: string;
  thumbnailUrl?: string;
  visibility: "public" | "members" | "service";
}

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const posts = await getAllFeedPosts();
    return NextResponse.json<FeedPostsAdminResponse>({ posts });
  } catch (err) {
    console.error("[admin/feed/posts] GET error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch feed posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdminRequest(req);
    const body: CreateFeedPostBody = await req.json();

    if (!body.title?.trim() || !body.description?.trim()) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const id = await createFeedPost({
      title: body.title.trim(),
      description: body.description.trim(),
      mediaType: body.mediaType || "text",
      mediaUrl: body.mediaUrl,
      thumbnailUrl: body.thumbnailUrl,
      visibility: body.visibility || "public",
      createdByAdminId: admin.uid,
      createdByAdminName: admin.name,
    });

    await getAdminDb().collection("feedAuditLogs").add({
      feedPostId: id,
      action: "create",
      changedByAdminId: admin.uid,
      changedByAdminName: admin.name,
      changedAt: new Date(),
    });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[admin/feed/posts] POST error:", err);
    const message = err instanceof Error ? err.message : "Failed to create feed post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
