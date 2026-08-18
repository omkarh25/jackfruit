import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { MembershipMode, MembershipTier } from "@/lib/membership-pricing";
import { stripUndefined } from "./utils";
import type { PaymentRecord } from "./payments";
import type { FirestoreUserProfile } from "./users";

const db = getFirestoreDb();
const membershipsCollection = "memberships";
const plansCollection = "membershipPlans";

export interface MembershipPlan {
  id?: string;
  tier: MembershipTier;
  durationMonths: number;
  priceOnline: number; // in rupees
  priceOffline: number; // in rupees
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface MembershipRecord {
  id?: string;
  userId: string;
  tier: MembershipTier;
  mode: MembershipMode;
  durationMonths: number;
  startDate: string; // ISO date
  expiryDate: string; // ISO date
  status: "active" | "expired";
  paymentId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AdminMembershipsData {
  plans: MembershipPlan[];
  memberships: MembershipRecord[];
  users: FirestoreUserProfile[];
  payments: PaymentRecord[];
}

// ─── Admin API Helpers ────────────────────────────────────────────────────────

export async function fetchAdminMembershipsApi(token: string): Promise<AdminMembershipsData> {
  const res = await fetch("/api/admin/memberships", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load admin membership data.");
  }
  return {
    plans: json.plans || [],
    memberships: json.memberships || [],
    users: json.users || [],
    payments: json.payments || [],
  };
}

export async function seedDefaultPlansApi(token: string): Promise<string> {
  const res = await fetch("/api/admin/memberships", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "seed" }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to seed default plans.");
  }
  return json.message || "Default plans seeded.";
}

export async function updateMembershipPlanApi(
  token: string,
  planId: string,
  data: Partial<Omit<MembershipPlan, "id" | "createdAt">>
): Promise<void> {
  const res = await fetch("/api/admin/memberships", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "updatePlan", planId, data }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to update plan.");
  }
}

export async function extendMembershipApi(
  token: string,
  membershipId: string,
  expiryDate: string,
  status = "active"
): Promise<void> {
  const res = await fetch("/api/admin/memberships", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "extend", membershipId, expiryDate, status }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to extend membership.");
  }
}

export async function updateMembershipTierApi(
  token: string,
  membershipId: string,
  tier: MembershipTier
): Promise<void> {
  const res = await fetch("/api/admin/memberships", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "updateTier", membershipId, tier }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to update membership tier.");
  }
}

// ─── Direct Firestore Client Methods (with API fallbacks) ────────────────────

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  const snap = await getDocs(collection(db, plansCollection));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as MembershipPlan)
    .sort((a, b) => a.tier.localeCompare(b.tier) || a.durationMonths - b.durationMonths);
}

export async function createMembershipPlan(
  data: Omit<MembershipPlan, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const clean = stripUndefined(data);
  const ref = await addDoc(collection(db, plansCollection), {
    ...clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMembershipPlan(
  id: string,
  data: Partial<Omit<MembershipPlan, "id" | "createdAt">>
): Promise<void> {
  const clean = stripUndefined(data);
  await updateDoc(doc(db, plansCollection, id), {
    ...clean,
    updatedAt: serverTimestamp(),
  });
}

export async function getMembershipsByUser(userId: string): Promise<MembershipRecord[]> {
  const q = query(collection(db, membershipsCollection), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as MembershipRecord)
    .sort((a, b) => (b.expiryDate || "").localeCompare(a.expiryDate || ""));
}

export async function getAllMemberships(): Promise<MembershipRecord[]> {
  const snap = await getDocs(collection(db, membershipsCollection));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as MembershipRecord)
    .sort((a, b) => (b.expiryDate || "").localeCompare(a.expiryDate || ""));
}

/** The user's current membership = the one with the latest expiry date. */
export async function getCurrentMembership(userId: string): Promise<MembershipRecord | null> {
  const all = await getMembershipsByUser(userId);
  return all.length > 0 ? all[0] : null;
}

export async function updateMembership(
  id: string,
  data: Partial<Omit<MembershipRecord, "id" | "createdAt">>
): Promise<void> {
  const clean = stripUndefined(data);
  await updateDoc(doc(db, membershipsCollection, id), {
    ...clean,
    updatedAt: serverTimestamp(),
  });
}

export type MembershipDisplayStatus = "Active" | "Expiring Soon" | "Expired";

export function computeMembershipStatus(m: MembershipRecord): {
  status: MembershipDisplayStatus;
  remainingDays: number;
} {
  const now = Date.now();
  const expiry = new Date(m.expiryDate).getTime();
  const remainingDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (remainingDays < 0) return { status: "Expired", remainingDays: 0 };
  if (remainingDays <= 15) return { status: "Expiring Soon", remainingDays };
  return { status: "Active", remainingDays };
}
