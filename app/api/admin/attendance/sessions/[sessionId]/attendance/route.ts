export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { saveAttendanceBulk, type SaveAttendanceInput, type AttendanceRecord } from "@/lib/db/attendance";

interface RouteParams {
  params: { sessionId: string };
}

function parseSessionId(sessionId: string): { itemType: AttendanceRecord["itemType"]; itemId: string; sessionDate: string } | null {
  const parts = sessionId.split(":");
  if (parts[0] === "workshop" && parts.length >= 3) {
    return {
      itemType: "workshop",
      itemId: parts[1],
      sessionDate: parts[2] === "nodate" ? "" : parts[2],
    };
  }
  if (parts[0] === "consultation" && parts.length >= 2) {
    return {
      itemType: "consultation",
      itemId: parts[1],
      sessionDate: "",
    };
  }
  return null;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const admin = await verifyAdminRequest(req);
    const session = parseSessionId(params.sessionId);

    if (!session) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const body: { records: SaveAttendanceInput[] } = await req.json();
    if (!Array.isArray(body.records) || body.records.length === 0) {
      return NextResponse.json({ error: "At least one attendance record is required" }, { status: 400 });
    }

    const db = getAdminDb();
    let itemName = "";

    if (session.itemType === "workshop") {
      const wsSnap = await db.collection("workshops").doc(session.itemId).get();
      itemName = wsSnap.exists ? (wsSnap.data()?.title as string) || "Workshop" : "Workshop";
    } else {
      const bookingSnap = await db.collection("bookings").doc(session.itemId).get();
      if (bookingSnap.exists) {
        const b = bookingSnap.data();
        itemName = (b?.serviceId as string) || "1:1 Consultation";
        if (!session.sessionDate) {
          session.sessionDate = (b?.slotDate as string) || "";
        }
      }
    }

    await saveAttendanceBulk(
      session.itemType,
      session.itemId,
      itemName,
      session.sessionDate,
      body.records,
      { uid: admin.uid, name: admin.name }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/attendance/sessions/[id]/attendance] error:", err);
    const message = err instanceof Error ? err.message : "Failed to save attendance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
