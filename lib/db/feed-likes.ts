import { getAdminDb } from "@/lib/firebase-admin";
import type { Timestamp } from "firebase/firestore";

export interface FeedLike {
  id?: string;
  feedPostId: string;
  userId: string;
  userName: string;
  likedAt: Timestamp | Date;
}

export async function getLikeByUserAndPost(
  userId: string,
  feedPostId: string
): Promise<FeedLike | null> {
  const db = getAdminDb();
  const snap = await db
    .collection("feedLikes")
    .where("feedPostId", "==", feedPostId)
    .where("userId", "==", userId)
    .limit(1)
    .get();
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as FeedLike);
}

export async function createFeedLike(
  feedPostId: string,
  userId: string,
  userName: string
): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection("feedLikes").doc();
  await ref.set({
    feedPostId,
    userId,
    userName,
    likedAt: new Date(),
  });
  return ref.id;
}

export async function deleteFeedLike(likeId: string): Promise<void> {
  const db = getAdminDb();
  await db.collection("feedLikes").doc(likeId).delete();
}

export async function getLikesByPost(feedPostId: string): Promise<FeedLike[]> {
  const db = getAdminDb();
  const snap = await db.collection("feedLikes").where("feedPostId", "==", feedPostId).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FeedLike));
}
