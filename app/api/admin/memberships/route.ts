export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  MEMBERSHIP_DURATIONS,
  OFFLINE_PRICES,
  ONLINE_PRICES,
  TIER_META,
  type MembershipTier,
} from "@/lib/membership-pricing";

const TIERS = Object.keys(TIER_META) as MembershipTier[];

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const db = getAdminDb();

    const [plansSnap, membersSnap, usersSnap, paymentsSnap] = await Promise.all([
      db.collection("membershipPlans").get(),
      db.collection("memberships").get(),
      db.collection("users").get(),
      db.collection("payments").get(),
    ]);

    const plans = plansSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const memberships = membersSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const users = usersSnap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "learner",
      };
    });

    const payments = paymentsSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId || "",
        amount: data.amount || 0,
        itemType: data.itemType || "",
        status: data.status || "",
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      };
    });

    return NextResponse.json({
      success: true,
      plans,
      memberships,
      users,
      payments,
    });
  } catch (err) {
    console.error("[api/admin/memberships GET] error:", err);
    const message = err instanceof Error ? err.message : "Failed to load memberships data";
    const status = message.startsWith("Unauthorized") || message.startsWith("Forbidden") ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdminRequest(req);
    const db = getAdminDb();
    const body = await req.json();
    const { action } = body;

    if (action === "seed") {
      const plansSnap = await db.collection("membershipPlans").get();
      const existingPlans = plansSnap.docs.map((d) => d.data());

      let createdCount = 0;
      for (const tier of TIERS) {
        for (const months of MEMBERSHIP_DURATIONS) {
          const exists = existingPlans.some(
            (p) => p.tier === tier && Number(p.durationMonths) === Number(months)
          );
          if (exists) continue;

          await db.collection("membershipPlans").add({
            tier,
            durationMonths: months,
            priceOnline: ONLINE_PRICES[tier][months],
            priceOffline: OFFLINE_PRICES[tier][months],
            active: true,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          createdCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Seeded ${createdCount} new default membership plans.`,
      });
    }

    if (action === "updatePlan") {
      const { planId, data } = body;
      if (!planId || !data) {
        return NextResponse.json({ success: false, error: "Missing planId or data" }, { status: 400 });
      }

      await db.collection("membershipPlans").doc(planId).update({
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    if (action === "extend") {
      const { membershipId, expiryDate, status } = body;
      if (!membershipId || !expiryDate) {
        return NextResponse.json({ success: false, error: "Missing membershipId or expiryDate" }, { status: 400 });
      }

      await db.collection("memberships").doc(membershipId).update({
        expiryDate,
        status: status || "active",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    if (action === "updateTier") {
      const { membershipId, tier } = body;
      if (!membershipId || !tier) {
        return NextResponse.json({ success: false, error: "Missing membershipId or tier" }, { status: 400 });
      }

      await db.collection("memberships").doc(membershipId).update({
        tier,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[api/admin/memberships POST] error:", err);
    const message = err instanceof Error ? err.message : "Failed to perform admin membership operation";
    const status = message.startsWith("Unauthorized") || message.startsWith("Forbidden") ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
