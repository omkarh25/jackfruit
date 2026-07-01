export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { updateAttendance, type AttendanceStatus } from "@/lib/db/attendance";

interface RouteParams {
  params: { id: string };
}

export interface UpdateAttendanceBody {
  status: AttendanceStatus;
  remarks?: string;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const admin = await verifyAdminRequest(req);
    const body: UpdateAttendanceBody = await req.json();

    if (!body.status || !["P", "A", "ML"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid attendance status" }, { status: 400 });
    }

    await updateAttendance(
      params.id,
      { status: body.status, remarks: body.remarks },
      { uid: admin.uid, name: admin.name }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/attendance/[id]] error:", err);
    const message = err instanceof Error ? err.message : "Failed to update attendance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
