import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const db = getFirestoreDb();
const paymentsCollection = "payments";

export interface PaymentRecord {
  id?: string;
  userId: string;
  orderId: string;
  amount: number; // in paise (e.g., 55500 for ₹555)
  currency: string;
  status: "created" | "captured" | "failed" | "refunded";
  itemType: "course" | "workshop" | "service" | "consultation" | "membership";
  itemId: string;
  itemTitle?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  couponCode?: string;
  discountAmount?: number;
  createdAt?: Timestamp;
}

export async function createPayment(data: Omit<PaymentRecord, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, paymentsCollection), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPaymentById(id: string): Promise<PaymentRecord | null> {
  const snap = await getDoc(doc(db, paymentsCollection, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as PaymentRecord) : null;
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentRecord["status"],
  razorpayPaymentId?: string,
  razorpaySignature?: string
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (razorpayPaymentId) update.razorpayPaymentId = razorpayPaymentId;
  if (razorpaySignature) update.razorpaySignature = razorpaySignature;
  await updateDoc(doc(db, paymentsCollection, id), update);
}

export async function getPaymentsByUser(userId: string): Promise<PaymentRecord[]> {
  // NOTE: no orderBy here — where + orderBy requires a composite index and
  // fails silently in production. Sort client-side instead.
  const q = query(collection(db, paymentsCollection), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as PaymentRecord)
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  const snap = await getDocs(collection(db, paymentsCollection));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PaymentRecord);
}

export async function getPaymentsByStatus(status: PaymentRecord["status"]): Promise<PaymentRecord[]> {
  const q = query(collection(db, paymentsCollection), where("status", "==", status));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PaymentRecord);
}
