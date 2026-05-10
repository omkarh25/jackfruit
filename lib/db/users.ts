import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  type Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";

const db = getFirestoreDb();
const usersCollection = "users";

export interface FirestoreUserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: "learner" | "admin";
  tags?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function getUserProfile(uid: string): Promise<FirestoreUserProfile | null> {
  const ref = doc(db, usersCollection, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as FirestoreUserProfile) : null;
}

export async function createUserProfile(
  uid: string,
  data: Omit<FirestoreUserProfile, "createdAt" | "updatedAt">
): Promise<void> {
  const ref = doc(db, usersCollection, uid);
  await setDoc(ref, {
    ...data,
    role: data.role ?? "learner",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<FirestoreUserProfile, "uid" | "createdAt">>
): Promise<void> {
  const ref = doc(db, usersCollection, uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function upsertUserProfile(
  uid: string,
  data: Omit<FirestoreUserProfile, "createdAt" | "updatedAt">
): Promise<void> {
  const existing = await getUserProfile(uid);
  if (existing) {
    await updateUserProfile(uid, data);
  } else {
    await createUserProfile(uid, data);
  }
}

export async function getAllUsers(): Promise<FirestoreUserProfile[]> {
  const snap = await getDocs(collection(db, usersCollection));
  return snap.docs.map((d) => d.data() as FirestoreUserProfile);
}

export async function getUsersByRole(role: "learner" | "admin"): Promise<FirestoreUserProfile[]> {
  const q = query(collection(db, usersCollection), where("role", "==", role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FirestoreUserProfile);
}

export function toUserProfile(data: FirestoreUserProfile): UserProfile {
  return {
    uid: data.uid,
    name: data.name,
    email: data.email,
    photoURL: data.photoURL,
    purchasedCourseIds: [],
    bookingIds: [],
    createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? new Date().toISOString(),
  };
}
