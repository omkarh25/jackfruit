import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/payment";
import { getAdminDb } from "@/lib/firebase-admin";
import { workshops as staticWorkshops } from "@/lib/data";

export interface CreateWorkshopOrderRequestBody {
  workshopId: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
}

export interface CreateWorkshopOrderResponse {
  orderId: string;
  amount: number; // in paise
  currency: string;
  paymentId: string;
}

/**
 * POST /api/payment/create-workshop-order
 *
 * Creates a Razorpay Order for a workshop using the price stored in Firestore or static data.
 * Also writes a PaymentRecord so the transaction can be tracked.
 */
export async function POST(req: Request) {
  try {
    const { workshopId, userId, customerName = "", customerEmail = "" }: CreateWorkshopOrderRequestBody = await req.json();

    if (!workshopId || !userId) {
      return NextResponse.json({ error: "workshopId and userId are required" }, { status: 400 });
    }

    let title = "Workshop Registration";
    let priceInRupees = 0;

    // 1. Try to read workshop from Firestore
    const wsSnap = await getAdminDb().collection("workshops").doc(workshopId).get();
    if (wsSnap.exists) {
      const data = wsSnap.data();
      title = data?.title || title;
      priceInRupees = Number(data?.price) || 0;
    } else {
      // 1b. Fallback: try static workshops by ID or slug
      const staticWs = staticWorkshops.find(w => w.id === workshopId || w.slug === workshopId);
      if (staticWs) {
        title = staticWs.title;
        priceInRupees = staticWs.price ? parseInt(staticWs.price.replace(/[^0-9]/g, "")) || 0 : 0;
      } else {
        return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
      }
    }

    if (priceInRupees <= 0) {
      return NextResponse.json({ error: "Invalid workshop price" }, { status: 500 });
    }

    // 2. Create Razorpay Order (amount is in paise).
    const receipt = `ws_${workshopId.slice(-20)}`.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40);
    const order = await createRazorpayOrder({
      amountInRupees: priceInRupees,
      receipt,
      notes: {
        workshopId,
        userId,
        customerName,
        customerEmail,
        itemType: "workshop",
      },
    });

    // 3. Persist PaymentRecord in Firestore (server-side).
    const paymentRef = getAdminDb().collection("payments").doc();
    await paymentRef.set({
      userId,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      status: "created",
      itemType: "workshop",
      itemId: workshopId,
      itemTitle: title,
      createdAt: new Date(),
    });

    return NextResponse.json<CreateWorkshopOrderResponse>({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      paymentId: paymentRef.id,
    });
  } catch (err) {
    console.error("[create-workshop-order] error:", err);
    const message = err instanceof Error ? err.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
