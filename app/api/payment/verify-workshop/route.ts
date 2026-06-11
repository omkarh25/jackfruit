import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/payment";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendConfirmationEmail } from "@/lib/notification-helpers";

export interface VerifyWorkshopPaymentRequestBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyWorkshopPaymentResponse {
  success: boolean;
  paymentId?: string;
  error?: string;
}

/**
 * POST /api/payment/verify-workshop
 *
 * Verifies the Razorpay payment signature server-side and updates the
 * payment record status to captured in Firestore.
 */
export async function POST(req: Request) {
  try {
    const body: VerifyWorkshopPaymentRequestBody = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json<VerifyWorkshopPaymentResponse>(
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
      return NextResponse.json<VerifyWorkshopPaymentResponse>(
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
      return NextResponse.json<VerifyWorkshopPaymentResponse>(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentDoc = paymentsQuery.docs[0];
    const paymentData = paymentDoc.data();

    // 3. Update payment record.
    await paymentDoc.ref.update({
      status: "captured",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      updatedAt: new Date(),
    });

    // 4. Send confirmation email
    try {
      const workshopId = paymentData?.itemId;
      let workshopDate = "";
      let whatsappLink = "";

      if (workshopId) {
        const wsSnap = await getAdminDb().collection("workshops").doc(workshopId).get();
        if (wsSnap.exists) {
          const wsData = wsSnap.data();
          workshopDate = wsData?.date || "";
          whatsappLink = wsData?.whatsappLink || "";
        }
      }

      // Get user details
      const userId = paymentData?.userId;
      let customerName = "";
      let customerEmail = "";
      if (userId) {
        const userSnap = await getAdminDb().collection("users").doc(userId).get();
        if (userSnap.exists) {
          const userData = userSnap.data();
          customerName = userData?.name || "";
          customerEmail = userData?.email || "";
        }
      }

      if (customerEmail) {
        await sendConfirmationEmail({
          itemType: "workshop",
          itemTitle: paymentData?.itemTitle || "Workshop",
          itemId: paymentDoc.id,
          date: workshopDate,
          whatsappLink: whatsappLink || undefined,
          customerName,
          customerEmail,
          userId,
          amount: paymentData?.amount,
        });
      }
    } catch (emailErr) {
      console.error("[verify-workshop] Failed to send confirmation email:", emailErr);
    }

    return NextResponse.json<VerifyWorkshopPaymentResponse>({
      success: true,
      paymentId: paymentDoc.id,
    });
  } catch (err) {
    console.error("[verify-workshop-payment] error:", err);
    const message = err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json<VerifyWorkshopPaymentResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
