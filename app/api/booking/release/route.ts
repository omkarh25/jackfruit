import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendPaymentFailedEmail } from "@/lib/notification-helpers";

export interface ReleaseBookingRequestBody {
  slotId: string;
  bookingId?: string;
  userId: string;
}

export interface ReleaseBookingResponse {
  success: boolean;
  error?: string;
}

/**
 * POST /api/booking/release
 *
 * Releases a held slot back to "available" when the user abandons or fails
 * the payment flow. Also cancels the pending booking record if one exists.
 */
export async function POST(req: Request) {
  try {
    const { slotId, bookingId, userId }: ReleaseBookingRequestBody = await req.json();

    if (!slotId || !userId) {
      return NextResponse.json<ReleaseBookingResponse>(
        { success: false, error: "slotId and userId are required" },
        { status: 400 }
      );
    }

    const slotRef = getAdminDb().collection("slots").doc(slotId);
    const slotSnap = await slotRef.get();

    if (!slotSnap.exists) {
      return NextResponse.json<ReleaseBookingResponse>(
        { success: false, error: "Slot not found" },
        { status: 404 }
      );
    }

    const slotData = slotSnap.data() as { status: string; bookedBy?: string };

    // Only release if still held/booked by this user.
    if (slotData.status === "available") {
      return NextResponse.json<ReleaseBookingResponse>({ success: true });
    }

    if (slotData.bookedBy && slotData.bookedBy !== userId) {
      return NextResponse.json<ReleaseBookingResponse>(
        { success: false, error: "Slot is held by another user" },
        { status: 403 }
      );
    }

    await slotRef.update({
      status: "available",
      bookedBy: null,
      heldAt: null,
      updatedAt: new Date(),
    });

    if (bookingId) {
      const bookingRef = getAdminDb().collection("bookings").doc(bookingId);
      const bookingSnap = await bookingRef.get();
      await bookingRef.update({
        status: "cancelled",
        updatedAt: new Date(),
      });

      // Notify user about failed/abandoned payment.
      try {
        if (bookingSnap.exists) {
          const bookingData = bookingSnap.data();
          const userSnap = await getAdminDb().collection("users").doc(userId).get();
          const userData = userSnap.exists ? userSnap.data() : null;
          if (userData?.email) {
            await sendPaymentFailedEmail({
              itemType: "consultation",
              itemTitle: bookingData?.serviceId || "1:1 Consultation",
              itemId: bookingId,
              amount: undefined,
              bookingId,
              customerName: userData?.name || bookingData?.clientName || "",
              customerEmail: userData.email,
              userId,
            });
          }
        }
      } catch (emailErr) {
        console.error("[release-booking] Failed to send payment failed email:", emailErr);
      }
    }

    return NextResponse.json<ReleaseBookingResponse>({ success: true });
  } catch (err) {
    console.error("[release-booking] error:", err);
    const message = err instanceof Error ? err.message : "Failed to release slot";
    return NextResponse.json<ReleaseBookingResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
