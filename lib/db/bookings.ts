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
const bookingsCollection = "bookings";

export interface BookingRecord {
  id?: string;
  userId: string;
  serviceId: string;
  workshopId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  slotId?: string;
  slotDate: string;
  slotTime: string;
  duration?: string;
  meetingLink?: string;
  status: "upcoming" | "completed" | "cancelled" | "no_show";
  intakeNotes?: string;
  internalNotes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function createBooking(data: Omit<BookingRecord, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, bookingsCollection), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getBookingById(id: string): Promise<BookingRecord | null> {
  const snap = await getDoc(doc(db, bookingsCollection, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as BookingRecord) : null;
}

export async function updateBooking(
  id: string,
  data: Partial<Omit<BookingRecord, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, bookingsCollection, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelBooking(id: string): Promise<void> {
  await updateDoc(doc(db, bookingsCollection, id), {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBooking(id: string): Promise<void> {
  await deleteDoc(doc(db, bookingsCollection, id));
}

export async function getBookingsByUser(userId: string): Promise<BookingRecord[]> {
  const q = query(
    collection(db, bookingsCollection),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingRecord);
}

export async function getAllBookings(): Promise<BookingRecord[]> {
  const snap = await getDocs(collection(db, bookingsCollection));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingRecord);
}

export async function getBookingsByStatus(status: BookingRecord["status"]): Promise<BookingRecord[]> {
  const q = query(collection(db, bookingsCollection), where("status", "==", status));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingRecord);
}

export async function getBookingsByEmail(email: string): Promise<BookingRecord[]> {
  const q = query(
    collection(db, bookingsCollection),
    where("clientEmail", "==", email),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingRecord);
}
