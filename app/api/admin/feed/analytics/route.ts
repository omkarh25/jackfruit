export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAllFeedPosts } from "@/lib/db/feed-posts";

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const posts = await getAllFeedPosts();

    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, p) => sum + (p.totalLikes || 0), 0);
    const totalShares = posts.reduce((sum, p) => sum + (p.totalShares || 0), 0);

    const topPosts = posts
      .map((p) => ({
        id: p.id,
        title: p.title,
        totalLikes: p.totalLikes || 0,
        totalShares: p.totalShares || 0,
        engagement: (p.totalLikes || 0) + (p.totalShares || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    return NextResponse.json({ totalPosts, totalLikes, totalShares, topPosts });
  } catch (err) {
    console.error("[admin/feed/analytics] error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
