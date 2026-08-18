import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/payment";
import { getAdminDb } from "@/lib/firebase-admin";
import { validateCoupon } from "@/lib/coupon-validation";
import {
  getMembershipPrice,
  type MembershipMode,
  type MembershipTier,
} from "@/lib/membership-pricing";
import { getKalariPrice } from "@/lib/kalari-pricing";

export interface CreateMembershipOrderRequest {
  membershipType: MembershipTier | string;
  durationMonths: number;
  mode?: MembershipMode;
  userId: string;
  customerName: string;
  customerEmail: string;
  couponCode?: string;
}

export interface CreateMembershipOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  paymentId: string;
  originalAmount?: number;
  discountAmount?: number;
  couponCode?: string;
}

/**
 * POST /api/membership/create-order
 *
 * Creates a Razorpay Order for a Project Ananda or Kalari Payattu membership using the
 * predefined price table. No slot or booking is involved.
 */
export async function POST(req: Request) {
  try {
    const body: CreateMembershipOrderRequest = await req.json();
    const { membershipType, durationMonths, userId, couponCode } = body;
    const mode: MembershipMode = body.mode === "online" ? "online" : "offline";

    if (!membershipType || !durationMonths || !userId) {
      return NextResponse.json(
        { error: "membershipType, durationMonths and userId are required" },
        { status: 400 }
      );
    }

    const isKalari =
      membershipType === "KALARI" ||
      membershipType === "Kalari Payattu" ||
      membershipType === "KALARI_PAYATTU";

    const priceInRupees = isKalari
      ? getKalariPrice(durationMonths, mode)
      : getMembershipPrice(membershipType as MembershipTier, durationMonths, mode);

    if (!priceInRupees || priceInRupees <= 0) {
      return NextResponse.json(
        { error: "Invalid membership plan or duration" },
        { status: 400 }
      );
    }

    // Validate coupon if provided.
    let finalAmountInRupees = priceInRupees;
    let discountAmountInRupees = 0;
    let appliedCouponCode: string | undefined;

    if (couponCode && couponCode.trim()) {
      const couponResult = await validateCoupon({
        code: couponCode,
        itemType: "membership",
        itemId: membershipType,
        originalAmount: priceInRupees,
        membershipType,
      });

      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error || "Invalid coupon" }, { status: 400 });
      }

      finalAmountInRupees = couponResult.finalAmount ?? priceInRupees;
      discountAmountInRupees = couponResult.discountAmount ?? 0;
      appliedCouponCode = couponResult.couponCode;
    }

    const receipt = `${isKalari ? "kalari" : "pa"}_${membershipType.toLowerCase().replace(/\s/g, "-")}_${durationMonths}m_${Date.now()}`.slice(0, 40);
    const itemTitle = isKalari
      ? `Kalari Payattu — ${durationMonths} Month${durationMonths > 1 ? "s" : ""} (${mode === "online" ? "Online" : "Offline"})`
      : `Project Ananda — ${membershipType} — ${durationMonths} Month${durationMonths > 1 ? "s" : ""} (${mode === "online" ? "Online" : "Offline"})`;

    const order = await createRazorpayOrder({
      amountInRupees: finalAmountInRupees,
      receipt,
      notes: {
        membershipType,
        durationMonths: String(durationMonths),
        mode,
        userId,
        itemType: "membership",
        couponCode: appliedCouponCode || "",
      },
    });

    // Persist PaymentRecord in Firestore.
    const paymentRef = getAdminDb().collection("payments").doc();
    await paymentRef.set({
      userId,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      status: "created",
      itemType: "membership",
      itemId: isKalari
        ? `kalari-payattu-${durationMonths}m-${mode}`
        : `project-ananda-${membershipType.toLowerCase().replace(/\s/g, "-")}-${durationMonths}m-${mode}`,
      itemTitle,
      membershipTier: membershipType,
      durationMonths,
      mode,
      couponCode: appliedCouponCode || null,
      discountAmount: discountAmountInRupees || null,
      createdAt: new Date(),
    });

    return NextResponse.json<CreateMembershipOrderResponse>({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      paymentId: paymentRef.id,
      originalAmount: priceInRupees,
      discountAmount: discountAmountInRupees,
      couponCode: appliedCouponCode,
    });
  } catch (err) {
    console.error("[membership/create-order] error:", err);
    const message = err instanceof Error ? err.message : "Failed to create membership order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
