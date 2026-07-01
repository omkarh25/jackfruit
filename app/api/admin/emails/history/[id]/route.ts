export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getEmailCampaignById } from "@/lib/db/email-campaigns";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await verifyAdminRequest(req);
    const { campaign, recipients } = await getEmailCampaignById(params.id);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign, recipients });
  } catch (err) {
    console.error("[admin/emails/history/[id]] error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch campaign details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
