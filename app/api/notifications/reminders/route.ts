import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendReminderEmail, type ReminderType } from "@/lib/notification-helpers";

const REMINDER_MINUTES: ReminderType[] = ["reminder_60", "reminder_30", "reminder_15", "reminder_5"];

/**
 * Try to parse a workshop date string like "15 May, 6:00 PM" into a Date object.
 * Returns null if unparseable.
 */
function parseWorkshopDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.toLowerCase().includes("recording")) return null;

  // Try common formats
  const currentYear = new Date().getFullYear();
  const patterns = [
    // "15 May, 6:00 PM" or "15 May 2024, 6:00 PM"
    { regex: /(\d{1,2})\s+([A-Za-z]+),?\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i, hasYear: false },
    // "15 May 2024, 6:00 PM"
    { regex: /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4}),?\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i, hasYear: true },
  ];

  for (const p of patterns) {
    const match = dateStr.match(p.regex);
    if (match) {
      let datePart: string;
      if (p.hasYear) {
        datePart = `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
      } else {
        datePart = `${match[1]} ${match[2]} ${currentYear} ${match[3]}`;
      }
      const d = new Date(datePart);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }
  }

  // Fallback: try native Date parsing
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  return null;
}

/**
 * POST /api/notifications/reminders
 *
 * Checks for upcoming consultations and workshops, sends reminder emails
 * at 60/30/15/5 minutes before start time.
 *
 * This endpoint is designed to be called by a cron job every minute.
 */
export async function POST(req: Request) {
  try {
    // Optional: verify a simple cron secret to prevent abuse
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    const now = new Date();
    const results: string[] = [];

    // ─── 1. Consultation Reminders ───
    const bookingsSnap = await db
      .collection("bookings")
      .where("status", "==", "upcoming")
      .get();

    for (const doc of bookingsSnap.docs) {
      const b = doc.data();
      const slotDate = b.slotDate as string | undefined;
      const slotTime = b.slotTime as string | undefined;
      const userId = b.userId as string;
      const clientEmail = b.clientEmail as string;
      const clientName = b.clientName as string;
      const serviceId = b.serviceId as string;
      const meetingLink = b.meetingLink as string | undefined;

      if (!slotDate || !slotTime || !clientEmail) continue;

      const eventDate = new Date(`${slotDate}T${slotTime}`);
      if (isNaN(eventDate.getTime())) continue;

      const diffMs = eventDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      // Only look ahead within the next 65 minutes
      if (diffMinutes < -5 || diffMinutes > 65) continue;

      for (const reminderType of REMINDER_MINUTES) {
        const targetMinutes = parseInt(reminderType.split("_")[1]);
        // Allow a ±1 minute window
        if (diffMinutes >= targetMinutes - 1 && diffMinutes <= targetMinutes + 1) {
          await sendReminderEmail(
            {
              itemType: "consultation",
              itemTitle: serviceId || "1:1 Consultation",
              itemId: doc.id,
              date: slotDate,
              time: slotTime,
              meetingLink: meetingLink || undefined,
              customerName: clientName || "",
              customerEmail: clientEmail,
              userId: userId || "",
            },
            reminderType
          );
          results.push(`consultation ${doc.id} ${reminderType}`);
          break; // only one reminder per booking per run
        }
      }
    }

    // ─── 2. Workshop Reminders ───
    // Find captured workshop payments from the last 30 days (to avoid scanning everything)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const paymentsSnap = await db
      .collection("payments")
      .where("itemType", "==", "workshop")
      .where("status", "==", "captured")
      .where("createdAt", ">=", thirtyDaysAgo)
      .get();

    for (const doc of paymentsSnap.docs) {
      const p = doc.data();
      const workshopId = p.itemId as string;
      const userId = p.userId as string;

      if (!workshopId || !userId) continue;

      // Get workshop date
      const wsSnap = await db.collection("workshops").doc(workshopId).get();
      if (!wsSnap.exists) continue;

      const wsData = wsSnap.data();
      const wsDate = parseWorkshopDate(wsData?.date);
      if (!wsDate) continue;

      const diffMs = wsDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      if (diffMinutes < -5 || diffMinutes > 65) continue;

      // Get user email
      const userSnap = await db.collection("users").doc(userId).get();
      if (!userSnap.exists) continue;
      const userData = userSnap.data();
      const customerEmail = userData?.email as string;
      const customerName = userData?.name as string;
      if (!customerEmail) continue;

      for (const reminderType of REMINDER_MINUTES) {
        const targetMinutes = parseInt(reminderType.split("_")[1]);
        if (diffMinutes >= targetMinutes - 1 && diffMinutes <= targetMinutes + 1) {
          await sendReminderEmail(
            {
              itemType: "workshop",
              itemTitle: p.itemTitle || wsData?.title || "Workshop",
              itemId: doc.id,
              date: wsData?.date || "",
              whatsappLink: wsData?.whatsappLink || undefined,
              customerName: customerName || "",
              customerEmail,
              userId,
            },
            reminderType
          );
          results.push(`workshop ${doc.id} ${reminderType}`);
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      details: results,
    });
  } catch (err) {
    console.error("[notifications/reminders] error:", err);
    const message = err instanceof Error ? err.message : "Reminder processing failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
