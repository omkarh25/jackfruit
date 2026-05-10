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
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const db = getFirestoreDb();
const testimonialsCollection = "testimonials";

export interface TestimonialRecord {
  id?: string;
  name: string;
  role: string;
  quote: string;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt?: Timestamp;
}

export async function createTestimonial(
  data: Omit<TestimonialRecord, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, testimonialsCollection), {
    ...data,
    isApproved: data.isApproved ?? false,
    createdAt: serverTimestamp(),
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
  await updateDoc(doc(db, testimonialsCollection, id), data);
}

export async function deleteTestimonial(id: string): Promise<void> {
  await deleteDoc(doc(db, testimonialsCollection, id));
}

export async function getAllTestimonials(): Promise<TestimonialRecord[]> {
  const snap = await getDocs(collection(db, testimonialsCollection));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestimonialRecord);
}

export async function getApprovedTestimonials(): Promise<TestimonialRecord[]> {
  const q = query(collection(db, testimonialsCollection), where("isApproved", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestimonialRecord);
}

export async function getFeaturedTestimonials(): Promise<TestimonialRecord[]> {
  const q = query(
    collection(db, testimonialsCollection),
    where("isApproved", "==", true),
    where("isFeatured", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestimonialRecord);
}
