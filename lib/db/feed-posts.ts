import { getAdminDb } from "@/lib/firebase-admin";
import type { Timestamp } from "firebase/firestore";

export type FeedMediaType = "text" | "image" | "video";
export type FeedVisibility = "public" | "members" | "service";

export interface FeedPost {
  id?: string;
  title: string;
  description: string;
  mediaType: FeedMediaType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  createdByAdminId: string;
  createdByAdminName: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  isActive: boolean;
  totalLikes: number;
  totalShares: number;
  visibility: FeedVisibility;
}

export interface CreateFeedPostInput {
  title: string;
  description: string;
  mediaType: FeedMediaType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  visibility: FeedVisibility;
  createdByAdminId: string;
  createdByAdminName: string;
}

export async function createFeedPost(input: CreateFeedPostInput): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection("feedPosts").doc();
  const now = new Date();
  await ref.set({
    ...input,
    isActive: true,
    totalLikes: 0,
    totalShares: 0,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateFeedPost(
  id: string,
  input: Partial<Omit<FeedPost, "id" | "createdAt" | "createdByAdminId" | "createdByAdminName">>
): Promise<void> {
  const db = getAdminDb();
  await db
    .collection("feedPosts")
    .doc(id)
    .update({
      ...input,
      updatedAt: new Date(),
    });
}

export async function deleteFeedPost(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection("feedPosts").doc(id).update({
    isActive: false,
    updatedAt: new Date(),
  });
}

export async function getFeedPostById(id: string): Promise<FeedPost | null> {
  const db = getAdminDb();
  const snap = await db.collection("feedPosts").doc(id).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as FeedPost) : null;
}

export async function getActiveFeedPosts(): Promise<FeedPost[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("feedPosts")
    .where("isActive", "==", true)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FeedPost));
}

export async function getAllFeedPosts(): Promise<FeedPost[]> {
  const db = getAdminDb();
  const snap = await db.collection("feedPosts").orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FeedPost));
}

export async function incrementFeedPostLikes(id: string, delta: number): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection("feedPosts").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return;
  const current = (snap.data()?.totalLikes as number) || 0;
  await ref.update({ totalLikes: Math.max(0, current + delta) });
}

export async function incrementFeedPostShares(id: string): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection("feedPosts").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return;
  const current = (snap.data()?.totalShares as number) || 0;
  await ref.update({ totalShares: current + 1 });
}
