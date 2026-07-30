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
const slotsCollection = "slots";

export interface SlotRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: string; // e.g. "60 min"
  price: number; // in rupees
  meetingLink?: string;
  status: "available" | "booked" | "held";
  bookedBy?: string; // userId
  heldAt?: Timestamp | null; // set when the slot is held; used for 15-min expiry
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function createSlot(
  data: Omit<SlotRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, slotsCollection), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getSlotById(id: string): Promise<SlotRecord | null> {
  const snap = await getDoc(doc(db, slotsCollection, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as SlotRecord) : null;
}

export async function updateSlot(
  id: string,
  data: Partial<Omit<SlotRecord, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, slotsCollection, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSlot(id: string): Promise<void> {
  await deleteDoc(doc(db, slotsCollection, id));
}

export async function getAllSlots(): Promise<SlotRecord[]> {
  const snap = await getDocs(collection(db, slotsCollection));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SlotRecord);
}

export async function getAvailableSlots(): Promise<SlotRecord[]> {
  const q = query(collection(db, slotsCollection), where("status", "==", "available"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SlotRecord);
}

export async function getSlotsByDate(date: string): Promise<SlotRecord[]> {
  const q = query(collection(db, slotsCollection), where("date", "==", date));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SlotRecord);
}

export async function getBookedSlots(): Promise<SlotRecord[]> {
  const q = query(collection(db, slotsCollection), where("status", "==", "booked"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SlotRecord);
}

export async function holdSlot(id: string, userId: string): Promise<void> {
  await updateDoc(doc(db, slotsCollection, id), {
    status: "held",
    bookedBy: userId,
    heldAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function bookSlot(id: string, userId: string): Promise<void> {
  await updateDoc(doc(db, slotsCollection, id), {
    status: "booked",
    bookedBy: userId,
    heldAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function releaseSlot(id: string): Promise<void> {
  await updateDoc(doc(db, slotsCollection, id), {
    status: "available",
    bookedBy: null,
    heldAt: null,
    updatedAt: serverTimestamp(),
  });
}
