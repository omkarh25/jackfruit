export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getFeedPostById, incrementFeedPostLikes } from "@/lib/db/feed-posts";
import { createFeedLike, deleteFeedLike, getLikeByUserAndPost } from "@/lib/db/feed-likes";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decoded: { uid: string };
    try {
      decoded = await getAdminAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const post = await getFeedPostById(params.id);
    if (!post || !post.isActive) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userSnap = await getAdminDb().collection("users").doc(decoded.uid).get();
    const userName = userSnap.exists ? (userSnap.data()?.name as string) || "User" : "User";

    const existingLike = await getLikeByUserAndPost(decoded.uid, params.id);

    if (existingLike) {
      await deleteFeedLike(existingLike.id!);
      await incrementFeedPostLikes(params.id, -1);
      return NextResponse.json({ liked: false, totalLikes: Math.max(0, (post.totalLikes || 0) - 1) });
    } else {
      await createFeedLike(params.id, decoded.uid, userName);
      await incrementFeedPostLikes(params.id, 1);
      return NextResponse.json({ liked: true, totalLikes: (post.totalLikes || 0) + 1 });
    }
  } catch (err) {
    console.error("[feed/posts/[id]/like] error:", err);
    const message = err instanceof Error ? err.message : "Failed to toggle like";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
