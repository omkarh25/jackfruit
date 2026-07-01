export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
import { getAdminDb } from "@/lib/firebase-admin";
import { createEmailCampaign } from "@/lib/db/email-campaigns";

export interface SendEmailRequestBody {
  subject: string;
  body: string;
  userIds: string[];
  templateId?: string;
}

export interface SendEmailResponse {
  success: boolean;
  campaignId: string;
  recipientCount: number;
  successCount: number;
  failedCount: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function applyPlaceholders(text: string, userName: string): string {
  return text.replace(/\{\{UserName\}\}/g, userName);
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdminRequest(req);
    const body: SendEmailRequestBody = await req.json();

    const { subject, body: emailBody, userIds, templateId } = body;

    if (!subject?.trim() || !emailBody?.trim()) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 });
    }

    const db = getAdminDb();
    const userSnapshots = await Promise.all(
      userIds.map((uid) => db.collection("users").doc(uid).get())
    );

    const recipients: {
      userId: string;
      userName: string;
      email: string;
      serviceName?: string;
      deliveryStatus: "sent" | "failed";
      errorMessage?: string;
    }[] = [];

    for (const snap of userSnapshots) {
      if (!snap.exists) {
        recipients.push({
          userId: snap.id,
          userName: "Unknown",
          email: "",
          deliveryStatus: "failed",
          errorMessage: "User not found",
        });
        continue;
      }

      const data = snap.data() as {
        name?: string;
        email?: string;
        tags?: string[];
      };

      if (!data.email) {
        recipients.push({
          userId: snap.id,
          userName: data.name || "Unknown",
          email: "",
          deliveryStatus: "failed",
          errorMessage: "Missing email address",
        });
        continue;
      }

      const personalizedSubject = applyPlaceholders(subject, data.name || "Member");
      const personalizedBody = applyPlaceholders(emailBody, data.name || "Member");

      try {
        await sendEmail({
          to: data.email,
          subject: personalizedSubject,
          html: personalizedBody,
        });
        recipients.push({
          userId: snap.id,
          userName: data.name || "Unknown",
          email: data.email,
          serviceName: data.tags?.join(", ") || undefined,
          deliveryStatus: "sent",
        });
      } catch (err) {
        recipients.push({
          userId: snap.id,
          userName: data.name || "Unknown",
          email: data.email,
          serviceName: data.tags?.join(", ") || undefined,
          deliveryStatus: "failed",
          errorMessage: err instanceof Error ? err.message : "Send failed",
        });
      }

      await sleep(100);
    }

    const campaignId = await createEmailCampaign(
      {
        subject,
        body: emailBody,
        sentByAdminId: admin.uid,
        sentByAdminName: admin.name,
        templateId,
      },
      recipients
    );

    const successCount = recipients.filter((r) => r.deliveryStatus === "sent").length;
    const failedCount = recipients.length - successCount;

    return NextResponse.json<SendEmailResponse>({
      success: true,
      campaignId,
      recipientCount: recipients.length,
      successCount,
      failedCount,
    });
  } catch (err) {
    console.error("[admin/emails/send] error:", err);
    const message = err instanceof Error ? err.message : "Failed to send emails";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
