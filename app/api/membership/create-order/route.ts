import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/payment";
import { getAdminDb } from "@/lib/firebase-admin";

export interface CreateMembershipOrderRequest {
  membershipType: "FLOW" | "RISE" | "INNER CIRCLE";
  durationMonths: number;
  userId: string;
  customerName: string;
  customerEmail: string;
}

export interface CreateMembershipOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  paymentId: string;
}

const PRICE_MAP: Record<string, Record<number, number>> = {
  FLOW: {
    1: 2200,
    3: 6000,
    6: 11000,
    12: 20000,
  },
  RISE: {
    1: 4500,
    3: 12500,
    6: 24000,
    12: 44000,
  },
  "INNER CIRCLE": {
    1: 9000,
    3: 25000,
    6: 48000,
    12: 88000,
  },
};

function getMembershipPrice(type: string, months: number): number {
  return PRICE_MAP[type]?.[months] ?? 0;
}

/**
 * POST /api/membership/create-order
 *
 * Creates a Razorpay Order for a Project Ananda membership using the
 * predefined price table. No slot or booking is involved.
 */
export async function POST(req: Request) {
  try {
    const body: CreateMembershipOrderRequest = await req.json();
    const { membershipType, durationMonths, userId } = body;

    if (!membershipType || !durationMonths || !userId) {
      return NextResponse.json(
        { error: "membershipType, durationMonths and userId are required" },
        { status: 400 }
      );
    }

    const priceInRupees = getMembershipPrice(membershipType, durationMonths);
    if (!priceInRupees || priceInRupees <= 0) {
      return NextResponse.json(
        { error: "Invalid membership plan or duration" },
        { status: 400 }
      );
    }

    const receipt = `pa_${membershipType.toLowerCase().replace(/\s/g, "-")}_${durationMonths}m_${Date.now()}`.slice(0, 40);
    const itemTitle = `Project Ananda — ${membershipType} — ${durationMonths} Month${durationMonths > 1 ? "s" : ""}`;

    const order = await createRazorpayOrder({
      amountInRupees: priceInRupees,
      receipt,
      notes: {
        membershipType,
        durationMonths: String(durationMonths),
        userId,
        itemType: "service",
      },
    });

    // Persist PaymentRecord in Firestore.
    const paymentRef = getAdminDb().collection("payments").doc();
    await paymentRef.set({
      userId,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      status: "created",
      itemType: "service",
      itemId: `project-ananda-${membershipType.toLowerCase().replace(/\s/g, "-")}-${durationMonths}m`,
      itemTitle,
      createdAt: new Date(),
    });

    return NextResponse.json<CreateMembershipOrderResponse>({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      paymentId: paymentRef.id,
    });
  } catch (err) {
    console.error("[membership/create-order] error:", err);
    const message = err instanceof Error ? err.message : "Failed to create membership order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
