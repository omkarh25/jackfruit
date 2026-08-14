export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { saveAttendanceBulk, type SaveAttendanceInput } from "@/lib/db/attendance";

const ITEM_TYPE = "service";
const ITEM_ID = "daily-attendance";
const ITEM_NAME = "Daily Attendance";

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
}

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date || !isValidDate(date)) {
      return NextResponse.json({ error: "Invalid date. Use YYYY-MM-DD." }, { status: 400 });
    }

    const db = getAdminDb();
    const selectedDate = new Date(date);

    // Active memberships: status is active and the selected date falls within start..expiry.
    const membershipsSnap = await db
      .collection("memberships")
      .where("status", "==", "active")
      .get();

    const membershipsByUser = new Map<
      string,
      { tier: string; mode: string; expiryDate: string; startDate: string }
    >();

    for (const doc of membershipsSnap.docs) {
      const data = doc.data();
      const userId = data.userId as string;
      if (!userId) continue;

      const start = data.startDate ? new Date(data.startDate) : new Date(0);
      const expiry = data.expiryDate ? new Date(data.expiryDate) : new Date(8640000000000000);

      if (selectedDate >= start && selectedDate <= expiry) {
        const existing = membershipsByUser.get(userId);
        // Keep the membership with the latest expiry if a user has multiple active ones.
        if (!existing || new Date(existing.expiryDate) < expiry) {
          membershipsByUser.set(userId, {
            tier: data.tier || "—",
            mode: data.mode || "—",
            expiryDate: data.expiryDate || "",
            startDate: data.startDate || "",
          });
        }
      }
    }

    const userIds = Array.from(membershipsByUser.keys());
    const users: {
      userId: string;
      userName: string;
      email: string;
      membership?: { tier: string; mode: string; expiryDate: string; startDate: string };
    }[] = [];

    for (const userId of userIds) {
      const userSnap = await db.collection("users").doc(userId).get();
      const userData = userSnap.exists ? userSnap.data() : null;
      users.push({
        userId,
        userName: (userData?.name as string) || "Unknown",
        email: (userData?.email as string) || "",
        membership: membershipsByUser.get(userId),
      });
    }

    // Existing attendance records for the selected date.
    const attendanceSnap = await db
      .collection("attendance")
      .where("itemType", "==", ITEM_TYPE)
      .where("itemId", "==", ITEM_ID)
      .where("sessionDate", "==", date)
      .get();

    const attendanceByUser = new Map<string, { status: string; remarks?: string; id: string }>();
    for (const doc of attendanceSnap.docs) {
      const data = doc.data();
      attendanceByUser.set(data.userId as string, {
        id: doc.id,
        status: data.attendanceStatus as string,
        remarks: data.remarks as string | undefined,
      });
    }

    return NextResponse.json({
      date,
      members: users,
      attendanceByUser: Object.fromEntries(attendanceByUser),
    });
  } catch (err) {
    console.error("[admin/attendance/daily] GET error:", err);
    const message = err instanceof Error ? err.message : "Failed to load daily attendance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdminRequest(req);
    const body: { date: string; records: SaveAttendanceInput[] } = await req.json();

    if (!body.date || !isValidDate(body.date)) {
      return NextResponse.json({ error: "Invalid date. Use YYYY-MM-DD." }, { status: 400 });
    }
    if (!Array.isArray(body.records) || body.records.length === 0) {
      return NextResponse.json({ error: "At least one record is required" }, { status: 400 });
    }

    await saveAttendanceBulk(
      ITEM_TYPE,
      ITEM_ID,
      ITEM_NAME,
      body.date,
      body.records,
      { uid: admin.uid, name: admin.name }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/attendance/daily] POST error:", err);
    const message = err instanceof Error ? err.message : "Failed to save daily attendance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
