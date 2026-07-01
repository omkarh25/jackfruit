export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAttendanceSummary, type AttendanceRecord } from "@/lib/db/attendance";

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const { searchParams } = new URL(req.url);

    const itemType = searchParams.get("itemType") as AttendanceRecord["itemType"];
    const itemId = searchParams.get("itemId");
    const sessionDate = searchParams.get("sessionDate");

    if (!itemType || !itemId || !sessionDate) {
      return NextResponse.json(
        { error: "itemType, itemId and sessionDate are required" },
        { status: 400 }
      );
    }

    const summary = await getAttendanceSummary(itemType, itemId, sessionDate);
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[admin/attendance/summary] error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
