export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import {
  createEmailTemplate,
  getAllEmailTemplates,
  type EmailTemplate,
} from "@/lib/db/email-templates";

export interface EmailTemplatesResponse {
  templates: EmailTemplate[];
}

export interface CreateTemplateRequestBody {
  name: string;
  subject: string;
  body: string;
}

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const templates = await getAllEmailTemplates();
    return NextResponse.json<EmailTemplatesResponse>({ templates });
  } catch (err) {
    console.error("[admin/email-templates] GET error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch templates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdminRequest(req);
    const body: CreateTemplateRequestBody = await req.json();

    if (!body.name?.trim() || !body.subject?.trim() || !body.body?.trim()) {
      return NextResponse.json(
        { error: "Name, subject and body are required" },
        { status: 400 }
      );
    }

    const id = await createEmailTemplate({
      name: body.name.trim(),
      subject: body.subject.trim(),
      body: body.body.trim(),
      createdByAdminId: admin.uid,
      createdByAdminName: admin.name,
    });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[admin/email-templates] POST error:", err);
    const message = err instanceof Error ? err.message : "Failed to create template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
