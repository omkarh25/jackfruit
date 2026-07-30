export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export interface MyAttendanceResponse {
  success: boolean;
  total?: number;
  present?: number;
  percentage?: number;
  error?: string;
}

/**
 * GET /api/attendance/me
 *
 * Returns the signed-in user's own attendance summary (present count, total
 * marked sessions, percentage). Auth via Firebase ID token (any user).
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json<MyAttendanceResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const decoded = await getAdminAuth().verifyIdToken(authHeader.split("Bearer ")[1]);

    const snap = await getAdminDb()
      .collection("attendance")
      .where("userId", "==", decoded.uid)
      .get();

    const total = snap.size;
    const present = snap.docs.filter((d) => d.data().attendanceStatus === "P").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return NextResponse.json<MyAttendanceResponse>({ success: true, total, present, percentage });
  } catch (err) {
    console.error("[attendance/me] error:", err);
    const message = err instanceof Error ? err.message : "Failed to load attendance";
    return NextResponse.json<MyAttendanceResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
