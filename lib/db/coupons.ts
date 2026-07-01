import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const db = getFirestoreDb();
const couponsCollection = "coupons";

export interface CouponRecord {
  id?: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  expiryDate?: Timestamp;
  usageLimit: number;
  usageCount: number;
  applicableItems?: string[]; // service/workshop IDs
  isActive: boolean;
  createdAt?: Timestamp;
}

export async function createCoupon(
  data: Omit<CouponRecord, "id" | "createdAt" | "usageCount">
): Promise<string> {
  const code = data.code.toUpperCase();
  await setDoc(doc(db, couponsCollection, code), {
    ...data,
    code,
    usageCount: 0,
    createdAt: serverTimestamp(),
  });
  return code;
}

export async function getCouponByCode(code: string): Promise<CouponRecord | null> {
  const snap = await getDoc(doc(db, couponsCollection, code.toUpperCase()));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as CouponRecord) : null;
}

export async function updateCoupon(
  code: string,
  data: Partial<Omit<CouponRecord, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, couponsCollection, code.toUpperCase()), data);
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const ref = doc(db, couponsCollection, code.toUpperCase());
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const current = snap.data() as CouponRecord;
    await updateDoc(ref, { usageCount: (current.usageCount ?? 0) + 1 });
  }
}

export async function deleteCoupon(code: string): Promise<void> {
  await deleteDoc(doc(db, couponsCollection, code.toUpperCase()));
}

export async function getAllCoupons(): Promise<CouponRecord[]> {
  const snap = await getDocs(collection(db, couponsCollection));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CouponRecord);
}

export async function getActiveCoupons(): Promise<CouponRecord[]> {
  const q = query(collection(db, couponsCollection), where("isActive", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CouponRecord);
}
