import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/payment";
import { getAdminDb } from "@/lib/firebase-admin";
import { validateCoupon } from "@/lib/coupon-validation";

export interface CreateOrderRequestBody {
  slotId: string;
  bookingId: string;
  userId: string;
  serviceTitle?: string;
  couponCode?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number; // in paise
  currency: string;
  paymentId: string;
  originalAmount?: number; // in rupees
  discountAmount?: number; // in rupees
  couponCode?: string;
}

/**
 * POST /api/payment/create-order
 *
 * Creates a Razorpay Order using the slot price stored in Firestore.
 * Also writes a PaymentRecord so the transaction can be tracked.
 */
export async function POST(req: Request) {
  try {
    const { slotId, bookingId, userId, serviceTitle = "1:1 Consultation", couponCode }: CreateOrderRequestBody = await req.json();

    if (!slotId || !bookingId || !userId) {
      return NextResponse.json({ error: "slotId, bookingId and userId are required" }, { status: 400 });
    }

    // 1. Read slot from Firestore to get the server-side price.
    const slotSnap = await getAdminDb().collection("slots").doc(slotId).get();
    if (!slotSnap.exists) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }
    const slotData = slotSnap.data() as { price: number; status: string; bookedBy?: string };

    if (slotData.status !== "held" && slotData.status !== "booked") {
      return NextResponse.json(
        { error: "Slot is no longer available. Please select another slot." },
        { status: 409 }
      );
    }

    if (slotData.bookedBy && slotData.bookedBy !== userId) {
      return NextResponse.json(
        { error: "Slot is held by another user. Please select another slot." },
        { status: 409 }
      );
    }

    const priceInRupees = Number(slotData.price);
    if (!priceInRupees || priceInRupees <= 0) {
      return NextResponse.json({ error: "Invalid slot price" }, { status: 500 });
    }

    // 2. Validate coupon if provided.
    let finalAmountInRupees = priceInRupees;
    let discountAmountInRupees = 0;
    let appliedCouponCode: string | undefined;

    if (couponCode && couponCode.trim()) {
      const couponResult = await validateCoupon({
        code: couponCode,
        itemType: "consultation",
        itemId: serviceTitle,
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
    const receipt = `booking_${bookingId.slice(-20)}`.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40);
    const order = await createRazorpayOrder({
      amountInRupees: finalAmountInRupees,
      receipt,
      notes: {
        slotId,
        bookingId,
        userId,
        itemType: "consultation",
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
      itemType: "consultation",
      itemId: bookingId,
      itemTitle: serviceTitle,
      couponCode: appliedCouponCode || null,
      discountAmount: discountAmountInRupees || null,
      createdAt: new Date(),
    });

    return NextResponse.json<CreateOrderResponse>({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      paymentId: paymentRef.id,
      originalAmount: priceInRupees,
      discountAmount: discountAmountInRupees,
      couponCode: appliedCouponCode,
    });
  } catch (err) {
    console.error("[create-order] error:", err);
    const message = err instanceof Error ? err.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
