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
  const ref = await addDoc(collection(db, testimonialsCollection), {
    ...data,
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
  await updateDoc(doc(db, testimonialsCollection, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await deleteDoc(doc(db, testimonialsCollection, id));
}

export async function getAllTestimonials(): Promise<TestimonialRecord[]> {
  const q = query(collection(db, testimonialsCollection), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestimonialRecord);
}

export async function getApprovedTestimonials(): Promise<TestimonialRecord[]> {
  const q = query(
    collection(db, testimonialsCollection),
    where("isApproved", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestimonialRecord);
}

export async function getFeaturedTestimonials(): Promise<TestimonialRecord[]> {
  const q = query(
    collection(db, testimonialsCollection),
    where("isApproved", "==", true),
    where("isFeatured", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestimonialRecord);
}
