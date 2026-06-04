import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/payment";
import { getAdminDb } from "@/lib/firebase-admin";

export interface VerifyPaymentRequestBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  paymentId?: string;
  error?: string;
}

/**
 * POST /api/payment/verify
 *
 * Verifies the Razorpay payment signature server-side and updates the
 * payment + booking records in Firestore.
 */
export async function POST(req: Request) {
  try {
    const body: VerifyPaymentRequestBody = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json<VerifyPaymentResponse>(
        { success: false, error: "Missing required verification fields" },
        { status: 400 }
      );
    }

    // 1. Verify signature.
    const isValid = verifyRazorpaySignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json<VerifyPaymentResponse>(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // 2. Find payment record by order id.
    const paymentsQuery = await getAdminDb()
      .collection("payments")
      .where("orderId", "==", razorpay_order_id)
      .limit(1)
      .get();

    if (paymentsQuery.empty) {
      return NextResponse.json<VerifyPaymentResponse>(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentDoc = paymentsQuery.docs[0];

    // 3. Update payment record.
    await paymentDoc.ref.update({
      status: "captured",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      updatedAt: new Date(),
    });

    // 4. Confirm booking.
    const bookingRef = getAdminDb().collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();
    let slotId: string | null = null;

    if (bookingSnap.exists) {
      const bookingData = bookingSnap.data();
      slotId = bookingData?.slotId ?? null;
      await bookingRef.update({
        status: "upcoming",
        updatedAt: new Date(),
      });
    }

    // 5. Lock slot as booked (in case it was only held).
    if (slotId) {
      await getAdminDb().collection("slots").doc(slotId).update({
        status: "booked",
        updatedAt: new Date(),
      });
    }

    return NextResponse.json<VerifyPaymentResponse>({
      success: true,
      paymentId: paymentDoc.id,
    });
  } catch (err) {
    console.error("[verify-payment] error:", err);
    const message = err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json<VerifyPaymentResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
