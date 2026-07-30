import { getAdminDb } from "@/lib/firebase-admin";
import type { Timestamp } from "firebase/firestore";

export type EmailCampaignStatus = "success" | "partial" | "failed";
export type EmailDeliveryStatus = "sent" | "failed";

export interface EmailCampaign {
  id?: string;
  subject: string;
  body: string;
  sentByAdminId: string;
  sentByAdminName: string;
  sentAt: Timestamp | Date;
  recipientCount: number;
  successCount: number;
  failedCount: number;
  status: EmailCampaignStatus;
  errorMessage?: string;
  templateId?: string;
}

export interface EmailRecipient {
  id?: string;
  userId: string;
  userName: string;
  email: string;
  serviceName?: string;
  deliveryStatus: EmailDeliveryStatus;
  errorMessage?: string;
  sentAt: Timestamp | Date;
}

export interface CreateEmailCampaignInput {
  subject: string;
  body: string;
  sentByAdminId: string;
  sentByAdminName: string;
  templateId?: string;
}

export async function createEmailCampaign(
  input: CreateEmailCampaignInput,
  recipients: Omit<EmailRecipient, "id" | "sentAt">[]
): Promise<string> {
  const db = getAdminDb();
  const campaignRef = db.collection("emailCampaigns").doc();

  const successCount = recipients.filter((r) => r.deliveryStatus === "sent").length;
  const failedCount = recipients.filter((r) => r.deliveryStatus === "failed").length;
  const status: EmailCampaignStatus =
    failedCount === 0 ? "success" : successCount === 0 ? "failed" : "partial";

  const now = new Date();

  await campaignRef.set({
    subject: input.subject,
    body: input.body,
    sentByAdminId: input.sentByAdminId,
    sentByAdminName: input.sentByAdminName,
    sentAt: now,
    recipientCount: recipients.length,
    successCount,
    failedCount,
    status,
    templateId: input.templateId || null,
  });

  const batch = db.batch();
  for (const recipient of recipients) {
    const recipientRef = campaignRef.collection("recipients").doc();
    // Firestore rejects undefined values — strip them before writing.
    const clean = Object.fromEntries(
      Object.entries({ ...recipient, sentAt: now }).filter(([, v]) => v !== undefined)
    );
    batch.set(recipientRef, clean);
  }
  await batch.commit();

  return campaignRef.id;
}

export async function getEmailCampaigns(options?: {
  limit?: number;
  offset?: number;
  search?: string;
  status?: EmailCampaignStatus;
  fromDate?: string;
  toDate?: string;
}): Promise<{ campaigns: EmailCampaign[]; total: number }> {
  const db = getAdminDb();
  let query = db.collection("emailCampaigns").orderBy("sentAt", "desc") as FirebaseFirestore.Query;

  if (options?.status) {
    query = query.where("status", "==", options.status);
  }

  if (options?.fromDate) {
    query = query.where("sentAt", ">=", new Date(options.fromDate));
  }

  if (options?.toDate) {
    const endOfDay = new Date(options.toDate);
    endOfDay.setHours(23, 59, 59, 999);
    query = query.where("sentAt", "<=", endOfDay);
  }

  const snapshot = await query.get();
  let campaigns = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as EmailCampaign[];

  if (options?.search) {
    const term = options.search.toLowerCase();
    campaigns = campaigns.filter((c) => c.subject.toLowerCase().includes(term));
  }

  const total = campaigns.length;
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  campaigns = campaigns.slice(offset, offset + limit);

  return { campaigns, total };
}

export async function getEmailCampaignById(id: string): Promise<{
  campaign: EmailCampaign | null;
  recipients: EmailRecipient[];
}> {
  const db = getAdminDb();
  const campaignSnap = await db.collection("emailCampaigns").doc(id).get();
  if (!campaignSnap.exists) {
    return { campaign: null, recipients: [] };
  }

  const campaign = { id: campaignSnap.id, ...campaignSnap.data() } as EmailCampaign;
  const recipientsSnap = await campaignSnap.ref.collection("recipients").orderBy("sentAt", "desc").get();
  const recipients = recipientsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as EmailRecipient[];

  return { campaign, recipients };
}
