export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";

export interface AttendanceSession {
  id: string;
  itemType: "workshop" | "consultation";
  itemId: string;
  itemName: string;
  sessionDate: string | null;
  sessionDateDisplay: string;
  registeredCount: number;
}

function parseWorkshopDate(dateStr: string): { date: string | null; display: string } {
  if (!dateStr || dateStr.toLowerCase().includes("recording")) {
    return { date: null, display: dateStr || "No date" };
  }

  const currentYear = new Date().getFullYear();
  const patterns = [
    { regex: /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4}),?\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i, hasYear: true },
    { regex: /(\d{1,2})\s+([A-Za-z]+),?\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i, hasYear: false },
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
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return { date: iso, display: dateStr };
      }
    }
  }

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { date: iso, display: dateStr };
  }

  return { date: null, display: dateStr };
}

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const db = getAdminDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const sessions: AttendanceSession[] = [];

    // ─── Workshops from captured payments ───
    const paymentsSnap = await db
      .collection("payments")
      .where("itemType", "==", "workshop")
      .where("status", "==", "captured")
      .get();

    const workshopRegistrations = new Map<string, Set<string>>();
    const workshopIds = new Set<string>();

    for (const doc of paymentsSnap.docs) {
      const data = doc.data();
      const workshopId = data.itemId as string;
      const userId = data.userId as string;
      if (!workshopId || !userId) continue;
      if (!workshopRegistrations.has(workshopId)) {
        workshopRegistrations.set(workshopId, new Set());
      }
      workshopRegistrations.get(workshopId)!.add(userId);
      workshopIds.add(workshopId);
    }

    for (const workshopId of Array.from(workshopIds)) {
      const wsSnap = await db.collection("workshops").doc(workshopId).get();
      const wsData = wsSnap.exists ? wsSnap.data() : null;
      const title = wsData?.title || "Unknown Workshop";
      const parsed = parseWorkshopDate(wsData?.date || "");

      if (parsed.date && parsed.date < todayIso) continue;

      sessions.push({
        id: `workshop:${workshopId}:${parsed.date || "nodate"}`,
        itemType: "workshop",
        itemId: workshopId,
        itemName: title,
        sessionDate: parsed.date,
        sessionDateDisplay: parsed.display,
        registeredCount: workshopRegistrations.get(workshopId)?.size || 0,
      });
    }

    // ─── Consultations from bookings ───
    const bookingsSnap = await db
      .collection("bookings")
      .where("status", "in", ["upcoming", "completed", "no_show"])
      .get();

    for (const doc of bookingsSnap.docs) {
      const b = doc.data();
      const slotDate = (b.slotDate as string) || "";
      if (slotDate && slotDate < todayIso) continue;

      sessions.push({
        id: `consultation:${doc.id}`,
        itemType: "consultation",
        itemId: doc.id,
        itemName: (b.serviceId as string) || "1:1 Consultation",
        sessionDate: slotDate || null,
        sessionDateDisplay: slotDate ? `${slotDate} at ${b.slotTime || "—"}` : "No date",
        registeredCount: 1,
      });
    }

    // Sort by sessionDate (nulls last), then name
    sessions.sort((a, b) => {
      if (a.sessionDate && b.sessionDate) return a.sessionDate.localeCompare(b.sessionDate);
      if (a.sessionDate) return -1;
      if (b.sessionDate) return 1;
      return a.itemName.localeCompare(b.itemName);
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("[admin/attendance/sessions] error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch sessions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
