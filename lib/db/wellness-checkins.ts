import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const db = getFirestoreDb();
const checkinsCollection = "wellnessCheckins";

export interface WellnessCheckin {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD (local)
  mood: number; // 1-5
  energy: number; // 1-5
  sleep: number; // 1-5
  gratitude: string;
  createdAt?: Timestamp;
}

export function todayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export async function addCheckin(
  data: Omit<WellnessCheckin, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, checkinsCollection), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCheckinsByUser(userId: string): Promise<WellnessCheckin[]> {
  // NOTE: no orderBy — where + orderBy needs a composite index; sort client-side.
  const q = query(collection(db, checkinsCollection), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as WellnessCheckin)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getTodayCheckin(userId: string): Promise<WellnessCheckin | null> {
  const q = query(
    collection(db, checkinsCollection),
    where("userId", "==", userId),
    where("date", "==", todayKey())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as WellnessCheckin;
}
