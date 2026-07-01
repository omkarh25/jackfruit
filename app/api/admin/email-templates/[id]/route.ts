export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { updateEmailTemplate, deleteEmailTemplate } from "@/lib/db/email-templates";

interface RouteParams {
  params: { id: string };
}

export interface UpdateTemplateRequestBody {
  name?: string;
  subject?: string;
  body?: string;
  isActive?: boolean;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await verifyAdminRequest(req);
    const body: UpdateTemplateRequestBody = await req.json();

    await updateEmailTemplate(params.id, {
      name: body.name,
      subject: body.subject,
      body: body.body,
      isActive: body.isActive,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/email-templates/[id]] PATCH error:", err);
    const message = err instanceof Error ? err.message : "Failed to update template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await verifyAdminRequest(req);
    await deleteEmailTemplate(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/email-templates/[id]] DELETE error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
