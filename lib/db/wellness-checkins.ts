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
import { stripUndefined } from "./utils";

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
  createdAt?: Timestamp | string;
}

export function todayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export async function addCheckinApi(
  token: string,
  data: Omit<WellnessCheckin, "id" | "createdAt" | "userId">
): Promise<string> {
  const res = await fetch("/api/checkin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to save check-in via API.");
  }
  return json.checkinId;
}

export async function getCheckinsApi(
  token: string
): Promise<{ today: WellnessCheckin | null; history: WellnessCheckin[] }> {
  const res = await fetch("/api/checkin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load check-ins via API.");
  }

  return {
    today: json.today || null,
    history: json.history || [],
  };
}

export async function addCheckin(
  data: Omit<WellnessCheckin, "id" | "createdAt">,
  token?: string
): Promise<string> {
  if (token) {
    return addCheckinApi(token, data);
  }
  const clean = stripUndefined(data);
  const ref = await addDoc(collection(db, checkinsCollection), {
    ...clean,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCheckinsByUser(userId: string, token?: string): Promise<WellnessCheckin[]> {
  if (token) {
    const res = await getCheckinsApi(token);
    return res.history;
  }
  // NOTE: no orderBy — where + orderBy needs a composite index; sort client-side.
  const q = query(collection(db, checkinsCollection), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as WellnessCheckin)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getTodayCheckin(userId: string, token?: string): Promise<WellnessCheckin | null> {
  if (token) {
    const res = await getCheckinsApi(token);
    return res.today;
  }
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
