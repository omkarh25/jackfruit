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
const servicesCollection = "services";

export interface ServiceRecord {
  id?: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  price: string;
  category?: "Healing" | "Coaching" | "Therapy";
  outcomes: string[];
  isVisible: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function createService(
  data: Omit<ServiceRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, servicesCollection), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getServiceById(id: string): Promise<ServiceRecord | null> {
  const snap = await getDoc(doc(db, servicesCollection, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as ServiceRecord) : null;
}

export async function getServiceBySlug(slug: string): Promise<ServiceRecord | null> {
  const q = query(collection(db, servicesCollection), where("slug", "==", slug));
  const snap = await getDocs(q);
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as ServiceRecord);
}

export async function updateService(
  id: string,
  data: Partial<Omit<ServiceRecord, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, servicesCollection, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, servicesCollection, id));
}

export async function getAllServices(): Promise<ServiceRecord[]> {
  const snap = await getDocs(collection(db, servicesCollection));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceRecord);
}

export async function getVisibleServices(): Promise<ServiceRecord[]> {
  const q = query(collection(db, servicesCollection), where("isVisible", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceRecord);
}
