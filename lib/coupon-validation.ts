import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export interface CouponRecordAdmin {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  expiryDate?: TimestampLike;
  usageLimit: number;
  usageCount: number;
  applicableItems?: string[];
  isActive: boolean;
}

export type TimestampLike =
  | { toMillis: () => number }
  | { seconds: number; nanoseconds?: number }
  | Date
  | string
  | number;

export interface ValidateCouponContext {
  code: string;
  itemType: "course" | "workshop" | "service" | "consultation" | "membership";
  itemId: string;
  originalAmount: number;
  membershipType?: string;
}

export interface ValidateCouponResult {
  valid: boolean;
  couponCode?: string;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  discountAmount?: number;
  finalAmount?: number;
  error?: string;
}

export function toTimestampMs(ts: TimestampLike | undefined | null): number | null {
  if (ts == null) return null;

  if (typeof ts === "object" && "toMillis" in ts && typeof ts.toMillis === "function") {
    return ts.toMillis();
  }

  if (typeof ts === "object" && "seconds" in ts) {
    return ts.seconds * 1000;
  }

  if (ts instanceof Date) {
    return ts.getTime();
  }

  if (typeof ts === "string" || typeof ts === "number") {
    const parsed = new Date(ts).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function isCouponApplicable(
  coupon: CouponRecordAdmin,
  itemType: ValidateCouponContext["itemType"],
  itemId: string,
  membershipType?: string
): boolean {
  const items = coupon.applicableItems ?? [];
  if (items.length === 0) return false;

  if (items.includes(itemId)) return true;

  if (itemType === "consultation") {
    return items.includes("consultation");
  }

  if (itemType === "membership" && membershipType) {
    return items.includes(membershipType);
  }

  return false;
}

export function calculateDiscount(
  originalAmount: number,
  discountType: "percentage" | "flat",
  discountValue: number
): { discountAmount: number; finalAmount: number } {
  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = Math.round((originalAmount * discountValue) / 100);
  } else {
    discountAmount = Math.min(discountValue, originalAmount);
  }

  const finalAmount = originalAmount - discountAmount;
  return { discountAmount, finalAmount };
}

export async function validateCoupon(context: ValidateCouponContext): Promise<ValidateCouponResult> {
  const { code, itemType, itemId, originalAmount, membershipType } = context;

  if (!code || !code.trim()) {
    return { valid: false, error: "Invalid coupon code" };
  }

  if (!itemType || !itemId) {
    return { valid: false, error: "Missing item information" };
  }

  if (originalAmount <= 0) {
    return { valid: false, error: "Invalid original amount" };
  }

  const normalizedCode = code.trim().toUpperCase();
  const db = getAdminDb();
  const couponSnap = await db.collection("coupons").doc(normalizedCode).get();

  if (!couponSnap.exists) {
    return { valid: false, error: "Invalid coupon code" };
  }

  const coupon = couponSnap.data() as CouponRecordAdmin;

  if (!coupon.isActive) {
    return { valid: false, error: "Coupon inactive" };
  }

  const expiryMs = toTimestampMs(coupon.expiryDate);
  if (expiryMs && Date.now() > expiryMs) {
    return { valid: false, error: "Coupon expired" };
  }

  const usageLimit = coupon.usageLimit ?? 0;
  const usageCount = coupon.usageCount ?? 0;
  if (usageLimit > 0 && usageCount >= usageLimit) {
    return { valid: false, error: "Coupon usage limit reached" };
  }

  if (!isCouponApplicable(coupon, itemType, itemId, membershipType)) {
    return {
      valid: false,
      error: "Coupon not applicable for this service/workshop/course/consultation",
    };
  }

  const { discountAmount, finalAmount } = calculateDiscount(
    originalAmount,
    coupon.discountType,
    coupon.discountValue
  );

  if (finalAmount < 1) {
    return { valid: false, error: "Discount exceeds item price" };
  }

  return {
    valid: true,
    couponCode: normalizedCode,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    finalAmount,
  };
}

export async function incrementCouponUsageAdmin(code: string): Promise<void> {
  if (!code) return;
  const db = getAdminDb();
  const ref = db.collection("coupons").doc(code.trim().toUpperCase());
  await ref.update({ usageCount: FieldValue.increment(1) });
}
