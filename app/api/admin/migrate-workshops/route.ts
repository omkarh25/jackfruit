export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";

export interface MigrateWorkshopsResponse {
  success: boolean;
  migratedCount?: number;
  skippedCount?: number;
  error?: string;
}

/**
 * POST /api/admin/migrate-workshops
 *
 * One-time, idempotent migration: copies every document from the legacy
 * `workshops` collection into `services` (with kind: "workshop"), then marks
 * the original workshop doc as migrated. Original docs are never deleted.
 */
export async function POST(req: Request) {
  try {
    await verifyAdminRequest(req);

    const db = getAdminDb();
    const workshopsSnap = await db.collection("workshops").get();

    let migratedCount = 0;
    let skippedCount = 0;

    for (const wsDoc of workshopsSnap.docs) {
      const ws = wsDoc.data();

      // Idempotency: skip if a service already references this workshop.
      const existing = await db
        .collection("services")
        .where("legacyWorkshopId", "==", wsDoc.id)
        .limit(1)
        .get();

      if (!existing.empty) {
        skippedCount++;
        if (ws.status !== "migrated") {
          await wsDoc.ref.update({ status: "migrated", updatedAt: new Date() });
        }
        continue;
      }

      const priceNumber = typeof ws.price === "number" ? ws.price : 0;
      const now = new Date();

      await db.collection("services").add({
        title: ws.title || "Workshop",
        slug: ws.slug || wsDoc.id,
        description: ws.description || "",
        longDescription: ws.longDescription || "",
        duration: ws.format || "Workshop",
        price: priceNumber > 0 ? `₹${priceNumber.toLocaleString("en-IN")}` : "Free",
        date: ws.date || "",
        dates: ws.dates || [],
        enquiryMode: ws.enquiryMode || false,
        category: "Workshop",
        outcomes: [],
        isVisible: ws.status !== "archived",
        paymentRedirectUrl: ws.paymentRedirectUrl || null,
        kind: "workshop",
        format: ws.format || null,
        location: ws.location || null,
        imageUrl: ws.imageUrl || null,
        whatsappLink: ws.whatsappLink || null,
        venueLink: ws.venueLink || null,
        maxParticipants: ws.maxParticipants ?? null,
        registrationsEnabled: ws.registrationsEnabled ?? true,
        legacyWorkshopId: wsDoc.id,
        createdAt: now,
        updatedAt: now,
      });

      await wsDoc.ref.update({ status: "migrated", updatedAt: now });
      migratedCount++;
    }

    return NextResponse.json<MigrateWorkshopsResponse>({
      success: true,
      migratedCount,
      skippedCount,
    });
  } catch (err) {
    console.error("[admin/migrate-workshops] error:", err);
    const message = err instanceof Error ? err.message : "Failed to migrate workshops";
    return NextResponse.json<MigrateWorkshopsResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
