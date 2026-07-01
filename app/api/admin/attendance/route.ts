export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAttendanceHistory, type AttendanceRecord } from "@/lib/db/attendance";

export interface AttendanceHistoryResponse {
  records: AttendanceRecord[];
  total: number;
}

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || undefined;
    const itemType = (searchParams.get("itemType") as AttendanceRecord["itemType"]) || undefined;
    const itemId = searchParams.get("itemId") || undefined;
    const sessionDate = searchParams.get("sessionDate") || undefined;
    const status = (searchParams.get("status") as "P" | "A" | "ML") || undefined;

    const offset = (page - 1) * limit;

    const { records, total } = await getAttendanceHistory({
      limit,
      offset,
      search,
      itemType,
      itemId,
      sessionDate,
      status,
    });

    return NextResponse.json<AttendanceHistoryResponse>({ records, total });
  } catch (err) {
    console.error("[admin/attendance] error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch attendance history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
