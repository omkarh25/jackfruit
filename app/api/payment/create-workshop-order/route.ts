import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/payment";
import { getAdminDb } from "@/lib/firebase-admin";
import { workshops as staticWorkshops } from "@/lib/data";
import { validateCoupon } from "@/lib/coupon-validation";

export interface CreateWorkshopOrderRequestBody {
  workshopId: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  couponCode?: string;
}

export interface CreateWorkshopOrderResponse {
  orderId: string;
  amount: number; // in paise
  currency: string;
  paymentId: string;
  originalAmount?: number; // in rupees
  discountAmount?: number; // in rupees
  couponCode?: string;
}

/**
 * POST /api/payment/create-workshop-order
 *
 * Creates a Razorpay Order for a workshop using the price stored in Firestore or static data.
 * Also writes a PaymentRecord so the transaction can be tracked.
 */
export async function POST(req: Request) {
  try {
    const { workshopId, userId, customerName = "", customerEmail = "", couponCode }: CreateWorkshopOrderRequestBody = await req.json();

    if (!workshopId || !userId) {
      return NextResponse.json({ error: "workshopId and userId are required" }, { status: 400 });
    }

    let title = "Workshop Registration";
    let priceInRupees = 0;

    // 1. Try to read workshop from Firestore
    const wsSnap = await getAdminDb().collection("workshops").doc(workshopId).get();
    if (wsSnap.exists) {
      const data = wsSnap.data();
      title = data?.title || title;
      priceInRupees = Number(data?.price) || 0;
    } else {
      // 1b. Fallback: try static workshops by ID or slug
      const staticWs = staticWorkshops.find(w => w.id === workshopId || w.slug === workshopId);
      if (staticWs) {
        title = staticWs.title;
        priceInRupees = staticWs.price ? parseInt(staticWs.price.replace(/[^0-9]/g, "")) || 0 : 0;
      } else {
        return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
      }
    }

    if (priceInRupees <= 0) {
      return NextResponse.json({ error: "Invalid workshop price" }, { status: 500 });
    }

    // 2. Validate coupon if provided.
    let finalAmountInRupees = priceInRupees;
    let discountAmountInRupees = 0;
    let appliedCouponCode: string | undefined;

    if (couponCode && couponCode.trim()) {
      const couponResult = await validateCoupon({
        code: couponCode,
        itemType: "workshop",
        itemId: workshopId,
        originalAmount: priceInRupees,
      });

      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error || "Invalid coupon" }, { status: 400 });
      }

      finalAmountInRupees = couponResult.finalAmount ?? priceInRupees;
      discountAmountInRupees = couponResult.discountAmount ?? 0;
      appliedCouponCode = couponResult.couponCode;
    }

    // 3. Create Razorpay Order (amount is in paise).
    const receipt = `ws_${workshopId.slice(-20)}`.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40);
    const order = await createRazorpayOrder({
      amountInRupees: finalAmountInRupees,
      receipt,
      notes: {
        workshopId,
        userId,
        customerName,
        customerEmail,
        itemType: "workshop",
        couponCode: appliedCouponCode || "",
      },
    });

    // 4. Persist PaymentRecord in Firestore (server-side).
    const paymentRef = getAdminDb().collection("payments").doc();
    await paymentRef.set({
      userId,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      status: "created",
      itemType: "workshop",
      itemId: workshopId,
      itemTitle: title,
      couponCode: appliedCouponCode || null,
      discountAmount: discountAmountInRupees || null,
      createdAt: new Date(),
    });

    return NextResponse.json<CreateWorkshopOrderResponse>({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      paymentId: paymentRef.id,
      originalAmount: priceInRupees,
      discountAmount: discountAmountInRupees,
      couponCode: appliedCouponCode,
    });
  } catch (err) {
    console.error("[create-workshop-order] error:", err);
    const message = err instanceof Error ? err.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
