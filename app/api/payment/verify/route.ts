import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/payment";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  sendConfirmationEmail,
  sendAdminPaymentNotification,
} from "@/lib/notification-helpers";
import { incrementCouponUsageAdmin } from "@/lib/coupon-validation";

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
    const paymentData = paymentDoc.data();
    const update: Record<string, unknown> = {
      status: "captured",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      updatedAt: new Date(),
    };
    await paymentDoc.ref.update(update);

    // 3b. Track coupon usage.
    if (paymentData?.couponCode) {
      try {
        await incrementCouponUsageAdmin(paymentData.couponCode as string);
      } catch (couponErr) {
        console.error("[verify-payment] Failed to increment coupon usage:", couponErr);
      }
    }

    // 4. Confirm booking.
    const bookingRef = getAdminDb().collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();
    let slotId: string | null = null;
    let meetingLink: string | undefined;

    if (bookingSnap.exists) {
      const bookingData = bookingSnap.data();
      slotId = bookingData?.slotId ?? null;

      // Copy the meeting link from the slot only now that payment is captured,
      // so the link is never exposed before payment.
      if (slotId) {
        const slotSnap = await getAdminDb().collection("slots").doc(slotId).get();
        meetingLink = slotSnap.exists ? (slotSnap.data()?.meetingLink as string | undefined) : undefined;
      }

      await bookingRef.update({
        status: "upcoming",
        ...(meetingLink ? { meetingLink } : {}),
        updatedAt: new Date(),
      });

      // 5. Send confirmation email
      try {
        const amount = paymentData?.amount;
        await sendConfirmationEmail({
          itemType: "consultation",
          itemTitle: bookingData?.serviceId || "1:1 Consultation",
          itemId: bookingId,
          date: bookingData?.slotDate || "",
          time: bookingData?.slotTime || "",
          meetingLink: meetingLink || bookingData?.meetingLink || undefined,
          customerName: bookingData?.clientName || "",
          customerEmail: bookingData?.clientEmail || "",
          userId: bookingData?.userId || "",
          amount,
        });
      } catch (emailErr) {
        console.error("[verify-payment] Failed to send confirmation email:", emailErr);
      }
    }

    // 6. Lock slot as booked (in case it was only held).
    if (slotId) {
      await getAdminDb().collection("slots").doc(slotId).update({
        status: "booked",
        heldAt: null,
        updatedAt: new Date(),
      });
    }

    // 7. Notify the admin (always — business inbox receives a copy of every
    // successful consultation payment). Failures are swallowed inside the
    // helper so they never block the verify response.
    try {
      const amount = paymentData?.amount as number | undefined;
      await sendAdminPaymentNotification({
        itemType: "consultation",
        itemTitle: (bookingSnap.exists ? bookingSnap.data()?.serviceId : "") as string || "1:1 Consultation",
        orderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount,
        customerName:
          (bookingSnap.exists ? bookingSnap.data()?.clientName : "") || "",
        customerEmail:
          (bookingSnap.exists ? bookingSnap.data()?.clientEmail : "") || "",
        customerPhone: bookingSnap.exists
          ? ((bookingSnap.data()?.clientPhone as string | undefined) ?? undefined)
          : undefined,
        date: bookingSnap.exists
          ? ((bookingSnap.data()?.slotDate as string | undefined) ?? undefined)
          : undefined,
        time: bookingSnap.exists
          ? ((bookingSnap.data()?.slotTime as string | undefined) ?? undefined)
          : undefined,
        extras: {
          bookingId,
          meetingLink: meetingLink ?? undefined,
        },
      });
    } catch (adminErr) {
      console.error("[verify-payment] Failed to send admin payment notification:", adminErr);
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
