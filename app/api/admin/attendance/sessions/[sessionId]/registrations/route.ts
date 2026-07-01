export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAttendanceBySession, type AttendanceRecord } from "@/lib/db/attendance";

interface RouteParams {
  params: { sessionId: string };
}

function parseSessionId(sessionId: string): { itemType: "workshop" | "consultation"; itemId: string; sessionDate: string } | null {
  const parts = sessionId.split(":");
  if (parts[0] === "workshop" && parts.length >= 3) {
    return {
      itemType: "workshop",
      itemId: parts[1],
      sessionDate: parts[2],
    };
  }
  if (parts[0] === "consultation" && parts.length >= 2) {
    return {
      itemType: "consultation",
      itemId: parts[1],
      sessionDate: "nodate",
    };
  }
  return null;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await verifyAdminRequest(req);
    const db = getAdminDb();
    const session = parseSessionId(params.sessionId);

    if (!session) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    let itemName = "";
    const registrations: {
      userId: string;
      userName: string;
      email: string;
      attendanceId?: string;
      attendanceStatus?: string;
      remarks?: string;
    }[] = [];

    if (session.itemType === "workshop") {
      const wsSnap = await db.collection("workshops").doc(session.itemId).get();
      itemName = wsSnap.exists ? (wsSnap.data()?.title as string) || "Workshop" : "Workshop";

      const paymentsSnap = await db
        .collection("payments")
        .where("itemType", "==", "workshop")
        .where("itemId", "==", session.itemId)
        .where("status", "==", "captured")
        .get();

      const seenUsers = new Set<string>();
      for (const doc of paymentsSnap.docs) {
        const data = doc.data();
        const userId = data.userId as string;
        if (!userId || seenUsers.has(userId)) continue;
        seenUsers.add(userId);

        const userSnap = await db.collection("users").doc(userId).get();
        const userData = userSnap.exists ? userSnap.data() : null;

        registrations.push({
          userId,
          userName: (userData?.name as string) || data.customerName || "Unknown",
          email: (userData?.email as string) || data.customerEmail || "",
        });
      }
    } else {
      const bookingSnap = await db.collection("bookings").doc(session.itemId).get();
      if (!bookingSnap.exists) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      const b = bookingSnap.data();
      itemName = (b?.serviceId as string) || "1:1 Consultation";

      const userId = b?.userId as string;
      const userSnap = userId ? await db.collection("users").doc(userId).get() : null;
      const userData = userSnap?.exists ? userSnap.data() : null;

      registrations.push({
        userId: userId || "",
        userName: (userData?.name as string) || (b?.clientName as string) || "Unknown",
        email: (userData?.email as string) || (b?.clientEmail as string) || "",
      });

      session.sessionDate = (b?.slotDate as string) || "nodate";
    }

    const existingAttendance = await getAttendanceBySession(
      session.itemType,
      session.itemId,
      session.sessionDate === "nodate" ? "" : session.sessionDate
    );

    const attendanceByUserId = new Map<string, AttendanceRecord>();
    for (const att of existingAttendance) {
      attendanceByUserId.set(att.userId, att);
    }

    for (const reg of registrations) {
      const att = attendanceByUserId.get(reg.userId);
      if (att) {
        reg.attendanceId = att.id;
        reg.attendanceStatus = att.attendanceStatus;
        reg.remarks = att.remarks;
      }
    }

    return NextResponse.json({
      session: { ...session, itemName, id: params.sessionId },
      registrations,
    });
  } catch (err) {
    console.error("[admin/attendance/sessions/[id]/registrations] error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch registrations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
