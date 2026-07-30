export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";

export interface AdminPaymentRow {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  amount: number; // in paise
  currency: string;
  status: string;
  itemType: string;
  itemId: string;
  itemTitle: string;
  razorpayPaymentId: string | null;
  couponCode: string | null;
  discountAmount: number | null;
  createdAt: string | null; // ISO string
}

export interface AdminPaymentsResponse {
  success: boolean;
  payments?: AdminPaymentRow[];
  summary?: {
    totalCaptured: number; // in paise
    countsByStatus: Record<string, number>;
    countsByType: Record<string, number>;
  };
  error?: string;
}

/**
 * GET /api/admin/payments?status=&itemType=&from=&to=
 *
 * Returns all payments (sorted newest first) plus a revenue summary.
 * Optional filters: status, itemType, from/to (YYYY-MM-DD, applied to createdAt).
 */
export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const itemType = searchParams.get("itemType") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const db = getAdminDb();
    const [paymentsSnap, usersSnap] = await Promise.all([
      db.collection("payments").get(),
      db.collection("users").get(),
    ]);

    const userMap = new Map<string, { name: string; email: string }>();
    for (const u of usersSnap.docs) {
      const data = u.data();
      userMap.set(u.id, { name: data.name || "", email: data.email || "" });
    }

    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;

    const payments: AdminPaymentRow[] = [];
    for (const doc of paymentsSnap.docs) {
      const p = doc.data();
      const createdAtDate: Date | null = p.createdAt?.toDate?.() ?? null;

      if (status && p.status !== status) continue;
      if (itemType && p.itemType !== itemType) continue;
      if (fromTime && (!createdAtDate || createdAtDate.getTime() < fromTime)) continue;
      if (toTime && (!createdAtDate || createdAtDate.getTime() > toTime)) continue;

      const user = userMap.get(p.userId) || { name: "", email: "" };
      payments.push({
        id: doc.id,
        userId: p.userId || "",
        userName: user.name,
        userEmail: user.email,
        orderId: p.orderId || "",
        amount: p.amount || 0,
        currency: p.currency || "INR",
        status: p.status || "created",
        itemType: p.itemType || "",
        itemId: p.itemId || "",
        itemTitle: p.itemTitle || "",
        razorpayPaymentId: p.razorpayPaymentId || null,
        couponCode: p.couponCode || null,
        discountAmount: p.discountAmount ?? null,
        createdAt: createdAtDate ? createdAtDate.toISOString() : null,
      });
    }

    payments.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    const countsByStatus: Record<string, number> = {};
    const countsByType: Record<string, number> = {};
    let totalCaptured = 0;
    for (const p of payments) {
      countsByStatus[p.status] = (countsByStatus[p.status] || 0) + 1;
      countsByType[p.itemType] = (countsByType[p.itemType] || 0) + 1;
      if (p.status === "captured") totalCaptured += p.amount;
    }

    return NextResponse.json<AdminPaymentsResponse>({
      success: true,
      payments,
      summary: { totalCaptured, countsByStatus, countsByType },
    });
  } catch (err) {
    console.error("[admin/payments] error:", err);
    const message = err instanceof Error ? err.message : "Failed to load payments";
    const statusCode = message.startsWith("Unauthorized") || message.startsWith("Forbidden") ? 401 : 500;
    return NextResponse.json<AdminPaymentsResponse>(
      { success: false, error: message },
      { status: statusCode }
    );
  }
}
