import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/payment";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  sendConfirmationEmail,
  sendAdminPaymentNotification,
} from "@/lib/notification-helpers";
import { incrementCouponUsageAdmin } from "@/lib/coupon-validation";

export interface VerifyMembershipRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyMembershipResponse {
  success: boolean;
  paymentId?: string;
  error?: string;
}

/**
 * POST /api/membership/verify
 *
 * Verifies the Razorpay payment signature for a membership and updates the
 * payment record to captured.
 */
export async function POST(req: Request) {
  try {
    const body: VerifyMembershipRequest = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json<VerifyMembershipResponse>(
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
      return NextResponse.json<VerifyMembershipResponse>(
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
      return NextResponse.json<VerifyMembershipResponse>(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentDoc = paymentsQuery.docs[0];
    const paymentData = paymentDoc.data();

    // 3. Update payment record.
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
        console.error("[membership/verify] Failed to increment coupon usage:", couponErr);
      }
    }

    // 3c. Create or extend the user's membership record.
    try {
      const userId = paymentData?.userId as string | undefined;
      const tier = paymentData?.membershipTier as string | undefined;
      const durationMonths = Number(paymentData?.durationMonths) || 0;

      if (userId && tier && durationMonths > 0) {
        const db = getAdminDb();
        const now = new Date();

        // Renewal extends from max(now, current expiry of an active membership).
        const existingSnap = await db
          .collection("memberships")
          .where("userId", "==", userId)
          .get();

        let baseDate = now;
        for (const doc of existingSnap.docs) {
          const exp = new Date(doc.data().expiryDate);
          if (!isNaN(exp.getTime()) && exp > baseDate) {
            baseDate = exp;
          }
        }

        const expiryDate = new Date(baseDate);
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

        await db.collection("memberships").add({
          userId,
          tier,
          mode: paymentData?.mode === "online" ? "online" : "offline",
          durationMonths,
          startDate: baseDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          status: "active",
          paymentId: paymentDoc.id,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (membershipErr) {
      console.error("[membership/verify] Failed to create membership record:", membershipErr);
    }

    // 4. Send confirmation email
    try {
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
          itemType: "membership",
          itemTitle: paymentData?.itemTitle || "Project Ananda Membership",
          itemId: paymentDoc.id,
          date: "Ongoing program",
          customerName,
          customerEmail,
          userId,
          amount: paymentData?.amount,
        });
      }

      // Notify the admin of every successful membership payment.
      try {
        await sendAdminPaymentNotification({
          itemType: "membership",
          itemTitle: (paymentData?.itemTitle as string) || "Project Ananda Membership",
          orderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          amount: paymentData?.amount,
          customerName,
          customerEmail,
          date: "Ongoing program",
          extras: {
            tier: (paymentData?.membershipTier as string) ?? undefined,
            durationMonths: paymentData?.durationMonths
              ? String(paymentData.durationMonths)
              : undefined,
          },
        });
      } catch (adminErr) {
        console.error("[membership/verify] Failed to send admin payment notification:", adminErr);
      }
    } catch (emailErr) {
      console.error("[membership/verify] Failed to send confirmation email:", emailErr);
    }

    return NextResponse.json<VerifyMembershipResponse>({
      success: true,
      paymentId: paymentDoc.id,
    });
  } catch (err) {
    console.error("[membership/verify] error:", err);
    const message = err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json<VerifyMembershipResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
