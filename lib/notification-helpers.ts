import { getAdminDb } from "./firebase-admin";
import { sendEmail } from "./email";

const BASE_URL = process.env.APP_BASE_URL || "https://tattvamniramaya.com";
const BUSINESS_EMAIL = process.env.BUSINESS_NOTIFICATION_EMAIL || "hemathehealer@tattvamniramaya.com";

// ─── Types ───

export type ReminderType = "reminder_60" | "reminder_30" | "reminder_15" | "reminder_5";

export type MembershipExpiryType =
  | "membership_expiry_30"
  | "membership_expiry_15"
  | "membership_expiry_7"
  | "membership_expiry_1"
  | "membership_expired";

export interface NotificationLog {
  id?: string;
  userId: string;
  recipientEmail: string;
  type: "confirmation" | ReminderType | MembershipExpiryType;
  itemType: "workshop" | "service" | "consultation" | "membership";
  itemId: string;
  itemTitle: string;
  sentAt: Date;
}

export interface EventDetails {
  itemType: "workshop" | "service" | "consultation" | "membership";
  itemTitle: string;
  itemId: string;
  date: string;
  time?: string;
  meetingLink?: string;
  whatsappLink?: string;
  customerName: string;
  customerEmail: string;
  userId: string;
  amount?: number;
}

export interface PaymentFailedDetails {
  itemType: "workshop" | "service" | "consultation" | "membership";
  itemTitle: string;
  itemId: string;
  amount?: number;
  bookingId?: string;
  customerName: string;
  customerEmail: string;
  userId: string;
  paymentLink?: string;
}

// ─── Logging ───

export async function wasNotificationSent(
  userId: string,
  itemId: string,
  type: NotificationLog["type"]
): Promise<boolean> {
  const db = getAdminDb();
  const snap = await db
    .collection("notificationLogs")
    .where("userId", "==", userId)
    .where("itemId", "==", itemId)
    .where("type", "==", type)
    .limit(1)
    .get();
  return !snap.empty;
}

export async function logNotification(log: Omit<NotificationLog, "id">): Promise<void> {
  const db = getAdminDb();
  await db.collection("notificationLogs").add({
    ...log,
    sentAt: new Date(),
  });
}

// ─── Email Templates ───

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #FAF8F5; color: #1A1423; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #5B3E8C 0%, #9578C9 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; font-family: 'Playfair Display', serif; margin: 0; font-size: 24px; }
    .body { padding: 32px 24px; }
    .body p { line-height: 1.7; color: #4a3f5c; }
    .details { background: #f8f6ff; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .details p { margin: 8px 0; font-size: 14px; }
    .details strong { color: #5B3E8C; }
    .cta { text-align: center; margin: 28px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #5B3E8C 0%, #9578C9 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; }
    .footer { background: #f0ede8; padding: 20px 24px; text-align: center; font-size: 12px; color: #8a7e9a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tattvam Niramaya</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>The Truth That Heals — A sanctuary for holistic healing and transformation.</p>
      <p>For queries, email us at <a href="mailto:${BUSINESS_EMAIL}">${BUSINESS_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function confirmationEmailTemplate(details: EventDetails): string {
  const itemLabel = details.itemType === "consultation" ? "1:1 Consultation" : details.itemType;
  const content = `
    <p>Hi <strong>${details.customerName}</strong>,</p>
    <p>Thank you for registering for the <strong>${itemLabel}</strong> with Tattvam Niramaya. Your registration is confirmed!</p>
    <div class="details">
      <p><strong>Program:</strong> ${details.itemTitle}</p>
      <p><strong>Date:</strong> ${details.date}${details.time ? ` at ${details.time}` : ""}</p>
      ${details.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${details.meetingLink}">${details.meetingLink}</a></p>` : ""}
      ${details.whatsappLink ? `<p><strong>WhatsApp Group:</strong> <a href="${details.whatsappLink}">Join here</a></p>` : ""}
      ${details.amount ? `<p><strong>Amount Paid:</strong> ₹${(details.amount / 100).toLocaleString("en-IN")}</p>` : ""}
    </div>
    <p>We look forward to seeing you there. If you have any questions, feel free to reply to this email or contact us on WhatsApp.</p>
    <div class="cta">
      <a href="${BASE_URL}/profile">Go to My Profile</a>
    </div>
  `;
  return baseTemplate(content);
}

export function reminderEmailTemplate(details: EventDetails, minutes: number): string {
  const itemLabel = details.itemType === "consultation" ? "1:1 Consultation" : details.itemType;
  const content = `
    <p>Hi <strong>${details.customerName}</strong>,</p>
    <p>This is a friendly reminder that your <strong>${itemLabel}</strong> with Tattvam Niramaya is starting in <strong>${minutes} minutes</strong>.</p>
    <div class="details">
      <p><strong>Program:</strong> ${details.itemTitle}</p>
      <p><strong>Date:</strong> ${details.date}${details.time ? ` at ${details.time}` : ""}</p>
      ${details.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${details.meetingLink}">${details.meetingLink}</a></p>` : ""}
      ${details.whatsappLink ? `<p><strong>WhatsApp Group:</strong> <a href="${details.whatsappLink}">Join here</a></p>` : ""}
    </div>
    <p>Please join a few minutes early. We look forward to seeing you!</p>
    <div class="cta">
      <a href="${BASE_URL}/profile">View in My Profile</a>
    </div>
  `;
  return baseTemplate(content);
}

export function paymentFailedEmailTemplate(details: PaymentFailedDetails): string {
  const itemLabel = details.itemType === "consultation" ? "1:1 Consultation" : details.itemType;
  const content = `
    <p>Hi <strong>${details.customerName}</strong>,</p>
    <p>We were unable to process your payment for <strong>${itemLabel}</strong> — <strong>${details.itemTitle}</strong>.</p>
    <div class="details">
      <p><strong>Service:</strong> ${details.itemTitle}</p>
      ${details.amount ? `<p><strong>Amount:</strong> ₹${(details.amount / 100).toLocaleString("en-IN")}</p>` : ""}
      ${details.bookingId ? `<p><strong>Reference:</strong> ${details.bookingId}</p>` : ""}
    </div>
    <p>Your registration has not yet been confirmed.</p>
    ${details.paymentLink ? `<p>To complete your booking, please retry your payment using the link below:</p><div class="cta"><a href="${details.paymentLink}">Retry Payment</a></div>` : ""}
    <p>If you continue to experience any issues, please contact <strong>Tattvam Wellness Center</strong> and we will be happy to assist you.</p>
  `;
  return baseTemplate(content);
}

// ─── Senders ───

export async function sendConfirmationEmail(details: EventDetails): Promise<void> {
  try {
    const alreadySent = await wasNotificationSent(details.userId, details.itemId, "confirmation");
    if (alreadySent) {
      console.log(`[notification] Confirmation already sent to ${details.customerEmail} for ${details.itemId}`);
      return;
    }

    const html = confirmationEmailTemplate(details);
    await sendEmail({
      to: details.customerEmail,
      subject: `Registration Confirmed — ${details.itemTitle}`,
      html,
    });

    await logNotification({
      userId: details.userId,
      recipientEmail: details.customerEmail,
      type: "confirmation",
      itemType: details.itemType,
      itemId: details.itemId,
      itemTitle: details.itemTitle,
      sentAt: new Date(),
    });

    console.log(`[notification] Confirmation sent to ${details.customerEmail}`);
  } catch (err) {
    console.error("[notification] Failed to send confirmation email:", err);
  }
}

export async function sendReminderEmail(
  details: EventDetails,
  reminderType: ReminderType
): Promise<void> {
  try {
    const alreadySent = await wasNotificationSent(details.userId, details.itemId, reminderType);
    if (alreadySent) {
      console.log(`[notification] ${reminderType} already sent to ${details.customerEmail} for ${details.itemId}`);
      return;
    }

    const minutes = parseInt(reminderType.split("_")[1]);
    const html = reminderEmailTemplate(details, minutes);
    await sendEmail({
      to: details.customerEmail,
      subject: `Starting in ${minutes} minutes — ${details.itemTitle}`,
      html,
    });

    await logNotification({
      userId: details.userId,
      recipientEmail: details.customerEmail,
      type: reminderType,
      itemType: details.itemType,
      itemId: details.itemId,
      itemTitle: details.itemTitle,
      sentAt: new Date(),
    });

    console.log(`[notification] ${reminderType} sent to ${details.customerEmail}`);
  } catch (err) {
    console.error(`[notification] Failed to send ${reminderType} email:`, err);
  }
}

export async function sendPaymentFailedEmail(details: PaymentFailedDetails): Promise<void> {
  try {
    const html = paymentFailedEmailTemplate(details);
    await sendEmail({
      to: details.customerEmail,
      subject: `Payment Failed for ${details.itemTitle}`,
      html,
    });
    await sendEmail({
      to: BUSINESS_EMAIL,
      subject: `Payment Failed Notification — ${details.itemTitle}`,
      html,
    });
    console.log(`[notification] Payment failed email sent to ${details.customerEmail} and admin`);
  } catch (err) {
    console.error("[notification] Failed to send payment failed email:", err);
  }
}
