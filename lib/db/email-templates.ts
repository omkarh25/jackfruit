import { getAdminDb } from "@/lib/firebase-admin";
import type { Timestamp } from "firebase/firestore";

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdByAdminId: string;
  createdByAdminName: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface CreateEmailTemplateInput {
  name: string;
  subject: string;
  body: string;
  createdByAdminId: string;
  createdByAdminName: string;
}

export async function createEmailTemplate(input: CreateEmailTemplateInput): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection("emailTemplates").doc();
  const now = new Date();
  await ref.set({
    name: input.name,
    subject: input.subject,
    body: input.body,
    isActive: true,
    createdByAdminId: input.createdByAdminId,
    createdByAdminName: input.createdByAdminName,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateEmailTemplate(
  id: string,
  input: Partial<Omit<EmailTemplate, "id" | "createdAt" | "createdByAdminId" | "createdByAdminName">>
): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection("emailTemplates").doc(id);
  await ref.update({
    ...input,
    updatedAt: new Date(),
  });
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection("emailTemplates").doc(id).delete();
}

export async function getEmailTemplateById(id: string): Promise<EmailTemplate | null> {
  const db = getAdminDb();
  const snap = await db.collection("emailTemplates").doc(id).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as EmailTemplate) : null;
}

export async function getAllEmailTemplates(): Promise<EmailTemplate[]> {
  const db = getAdminDb();
  const snap = await db.collection("emailTemplates").orderBy("updatedAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as EmailTemplate));
}
