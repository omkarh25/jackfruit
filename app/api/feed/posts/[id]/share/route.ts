export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getFeedPostById, incrementFeedPostShares } from "@/lib/db/feed-posts";
import { createFeedShare } from "@/lib/db/feed-shares";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    let userId: string | undefined;
    let userName: string | undefined;

    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split("Bearer ")[1];
        const decoded = await getAdminAuth().verifyIdToken(token);
        userId = decoded.uid;
        const userSnap = await getAdminDb().collection("users").doc(userId).get();
        userName = userSnap.exists ? (userSnap.data()?.name as string) || "User" : "User";
      } catch {
        // ignore invalid token
      }
    }

    const body: { shareMethod?: string } = await req.json().catch(() => ({}));
    const shareMethod = body.shareMethod || "copy_link";

    const post = await getFeedPostById(params.id);
    if (!post || !post.isActive) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await createFeedShare(params.id, shareMethod, userId, userName);
    await incrementFeedPostShares(params.id);

    return NextResponse.json({ totalShares: (post.totalShares || 0) + 1 });
  } catch (err) {
    console.error("[feed/posts/[id]/share] error:", err);
    const message = err instanceof Error ? err.message : "Failed to record share";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
