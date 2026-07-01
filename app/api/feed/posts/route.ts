export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getActiveFeedPosts, type FeedPost } from "@/lib/db/feed-posts";
import { getLikeByUserAndPost } from "@/lib/db/feed-likes";

export interface FeedPostResponse extends FeedPost {
  id: string;
  isLiked?: boolean;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("Authorization");
    let userId: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split("Bearer ")[1];
        const decoded = await getAdminAuth().verifyIdToken(token);
        userId = decoded.uid;
      } catch {
        // ignore invalid token
      }
    }

    const posts = await getActiveFeedPosts();

    let responsePosts: FeedPostResponse[] = posts.map((post) => ({ ...post, id: post.id! }));

    if (userId) {
      responsePosts = await Promise.all(
        responsePosts.map(async (post) => {
          const like = await getLikeByUserAndPost(userId!, post.id);
          return { ...post, isLiked: !!like };
        })
      );
    }

    return NextResponse.json({ posts: responsePosts });
  } catch (err) {
    console.error("[feed/posts] error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch feed posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
