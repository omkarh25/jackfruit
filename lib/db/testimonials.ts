import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const db = getFirestoreDb();
const testimonialsCollection = "testimonials";

export type TestimonialType = "text" | "video" | "image";

export interface TestimonialRecord {
  id?: string;
  type: TestimonialType;
  name: string;
  role: string;
  quote?: string;
  mediaUrl?: string;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function createTestimonial(
  data: Omit<TestimonialRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  // Firestore rejects undefined values — strip them before writing.
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(db, testimonialsCollection), {
    ...clean,
    isApproved: data.isApproved ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getTestimonialById(id: string): Promise<TestimonialRecord | null> {
  const snap = await getDoc(doc(db, testimonialsCollection, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as TestimonialRecord) : null;
}

export async function updateTestimonial(
  id: string,
  data: Partial<Omit<TestimonialRecord, "id" | "createdAt">>
): Promise<void> {
  // Firestore rejects undefined values — strip them before writing.
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  await updateDoc(doc(db, testimonialsCollection, id), {
    ...clean,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await deleteDoc(doc(db, testimonialsCollection, id));
}

export async function getAllTestimonials(): Promise<TestimonialRecord[]> {
  // NOTE: no orderBy in query to avoid composite index failures. Sort client-side.
  const snap = await getDocs(collection(db, testimonialsCollection));
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestimonialRecord);
  return records.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
}

export async function getApprovedTestimonials(): Promise<TestimonialRecord[]> {
  // NOTE: no orderBy here — a where+orderBy query requires a composite index
  // and fails silently on the live site if the index is missing.
  // Sorting is done client-side instead.
  const q = query(
    collection(db, testimonialsCollection),
    where("isApproved", "==", true)
  );
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestimonialRecord);
  return records.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
}

export async function getFeaturedTestimonials(): Promise<TestimonialRecord[]> {
  // NOTE: no orderBy here to avoid missing composite index errors.
  const q = query(
    collection(db, testimonialsCollection),
    where("isApproved", "==", true),
    where("isFeatured", "==", true)
  );
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestimonialRecord);
  return records.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
}
