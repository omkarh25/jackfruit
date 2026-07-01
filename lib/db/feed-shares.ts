import { getAdminDb } from "@/lib/firebase-admin";
import type { Timestamp } from "firebase/firestore";

export interface FeedShare {
  id?: string;
  feedPostId: string;
  userId?: string;
  userName?: string;
  shareMethod: string;
  sharedAt: Timestamp | Date;
}

export async function createFeedShare(
  feedPostId: string,
  shareMethod: string,
  userId?: string,
  userName?: string
): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection("feedShares").doc();
  await ref.set({
    feedPostId,
    userId: userId || null,
    userName: userName || null,
    shareMethod,
    sharedAt: new Date(),
  });
  return ref.id;
}

export async function getSharesByPost(feedPostId: string): Promise<FeedShare[]> {
  const db = getAdminDb();
  const snap = await db.collection("feedShares").where("feedPostId", "==", feedPostId).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FeedShare));
}
