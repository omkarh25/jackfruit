export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getEmailCampaigns, type EmailCampaign } from "@/lib/db/email-campaigns";

export interface EmailHistoryResponse {
  campaigns: EmailCampaign[];
  total: number;
}

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as "success" | "partial" | "failed") || undefined;
    const fromDate = searchParams.get("from") || undefined;
    const toDate = searchParams.get("to") || undefined;

    const offset = (page - 1) * limit;

    const { campaigns, total } = await getEmailCampaigns({
      limit,
      offset,
      search,
      status,
      fromDate,
      toDate,
    });

    return NextResponse.json<EmailHistoryResponse>({ campaigns, total });
  } catch (err) {
    console.error("[admin/emails/history] error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch email history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
