export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { updateFeedPost, deleteFeedPost, getFeedPostById } from "@/lib/db/feed-posts";
import { getAdminDb } from "@/lib/firebase-admin";

interface RouteParams {
  params: { id: string };
}

export interface UpdateFeedPostBody {
  title?: string;
  description?: string;
  mediaType?: "text" | "image" | "video";
  mediaUrl?: string;
  thumbnailUrl?: string;
  visibility?: "public" | "members" | "service";
  isActive?: boolean;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const admin = await verifyAdminRequest(req);
    const body: UpdateFeedPostBody = await req.json();

    const post = await getFeedPostById(params.id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await updateFeedPost(params.id, {
      title: body.title,
      description: body.description,
      mediaType: body.mediaType,
      mediaUrl: body.mediaUrl,
      thumbnailUrl: body.thumbnailUrl,
      visibility: body.visibility,
      isActive: body.isActive,
    });

    await getAdminDb().collection("feedAuditLogs").add({
      feedPostId: params.id,
      action: "edit",
      changedByAdminId: admin.uid,
      changedByAdminName: admin.name,
      changedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/feed/posts/[id]] PATCH error:", err);
    const message = err instanceof Error ? err.message : "Failed to update feed post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const admin = await verifyAdminRequest(req);

    const post = await getFeedPostById(params.id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await deleteFeedPost(params.id);

    await getAdminDb().collection("feedAuditLogs").add({
      feedPostId: params.id,
      action: "delete",
      changedByAdminId: admin.uid,
      changedByAdminName: admin.name,
      changedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/feed/posts/[id]] DELETE error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete feed post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
