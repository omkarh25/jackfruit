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
const workshopsCollection = "workshops";

export interface WorkshopRecord {
  id?: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  date: string;
  format: "Live Zoom" | "Recording";
  price: number;
  maxParticipants?: number;
  location?: "Online" | "Offline";
  imageUrl?: string;
  whatsappLink?: string;
  registrationsEnabled: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function createWorkshop(
  data: Omit<WorkshopRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, workshopsCollection), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getWorkshopById(id: string): Promise<WorkshopRecord | null> {
  const snap = await getDoc(doc(db, workshopsCollection, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as WorkshopRecord) : null;
}

export async function getWorkshopBySlug(slug: string): Promise<WorkshopRecord | null> {
  const q = query(collection(db, workshopsCollection), where("slug", "==", slug));
  const snap = await getDocs(q);
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as WorkshopRecord);
}

export async function updateWorkshop(
  id: string,
  data: Partial<Omit<WorkshopRecord, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, workshopsCollection, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWorkshop(id: string): Promise<void> {
  await deleteDoc(doc(db, workshopsCollection, id));
}

export async function getAllWorkshops(): Promise<WorkshopRecord[]> {
  const snap = await getDocs(collection(db, workshopsCollection));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WorkshopRecord);
}

export async function getLiveWorkshops(): Promise<WorkshopRecord[]> {
  const q = query(collection(db, workshopsCollection), where("format", "==", "Live Zoom"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WorkshopRecord);
}
