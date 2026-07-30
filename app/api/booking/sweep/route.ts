import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export interface SweepHeldSlotsResponse {
  success: boolean;
  releasedCount?: number;
  error?: string;
}

const HOLD_EXPIRY_MINUTES = 15;

/**
 * POST /api/booking/sweep
 *
 * Releases slots that have been "held" longer than 15 minutes (e.g. the user
 * abandoned the payment flow) back to "available", and cancels any pending
 * booking referencing those slots.
 *
 * Called fire-and-forget from the booking page and admin consultations page;
 * can also be wired to a cron job.
 */
export async function POST(req: Request) {
  try {
    // Optional: verify a simple cron secret to prevent abuse
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json<SweepHeldSlotsResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const cutoff = new Date(Date.now() - HOLD_EXPIRY_MINUTES * 60 * 1000);

    const heldSnap = await db
      .collection("slots")
      .where("status", "==", "held")
      .get();

    let releasedCount = 0;

    for (const slotDoc of heldSnap.docs) {
      const slotData = slotDoc.data();
      const heldAt = slotData.heldAt?.toDate?.() as Date | undefined;

      // Only release holds older than the expiry window. Slots without a
      // heldAt timestamp predate this feature; leave them alone.
      if (!heldAt || heldAt > cutoff) continue;

      await slotDoc.ref.update({
        status: "available",
        bookedBy: null,
        heldAt: null,
        updatedAt: new Date(),
      });
      releasedCount++;

      // Cancel any pending booking referencing this slot.
      const pendingSnap = await db
        .collection("bookings")
        .where("slotId", "==", slotDoc.id)
        .where("status", "==", "pending")
        .get();

      for (const bookingDoc of pendingSnap.docs) {
        await bookingDoc.ref.update({
          status: "cancelled",
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json<SweepHeldSlotsResponse>({ success: true, releasedCount });
  } catch (err) {
    console.error("[booking/sweep] error:", err);
    const message = err instanceof Error ? err.message : "Failed to sweep held slots";
    return NextResponse.json<SweepHeldSlotsResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
