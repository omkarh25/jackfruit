export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import {
  seedConsultationSlots,
  type SlotSeedConfig,
  type SlotSeedResult,
} from "@/lib/db/slot-seeding";

export interface SeedSlotsRequest {
  /** Optional override for default "September YYYY" seed. */
  year?: number;
  month?: number; // 0-indexed (0 = January, 8 = September)
  startDay?: number;
  endDay?: number;
  /** Optional overrides. */
  startHour?: number;
  endHour?: number;
  durationMinutes?: number;
  price?: number;
  weekdays?: number[];
  meetingLink?: string;
}

export interface SeedSlotsResponse extends SlotSeedResult {
  success: boolean;
  error?: string;
  appliedConfig?: SlotSeedConfig;
}

/**
 * POST /api/admin/seed-slots
 *
 * Admin-only. Bulk-creates consultation slots for a date range.
 *
 * Defaults: September of the current year (or the supplied year), Mon–Thu,
 * 11:00–16:00 (so 11:00, 11:30, 12:00, … up to but not including 16:00),
 * 30 min slots, ₹555 each. Idempotent — re-running on the same range skips
 * already-created (date, time) pairs.
 */
export async function POST(req: Request) {
  try {
    await verifyAdminRequest(req);

    const body: SeedSlotsRequest = await req.json().catch(() => ({}));

    const now = new Date();
    const year = body.year ?? now.getFullYear();
    const month = body.month !== undefined ? body.month : 8; // September
    const startDay = body.startDay ?? 1;
    const endDay = body.endDay ?? new Date(year, month + 1, 0).getDate();

    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      startDay
    ).padStart(2, "0")}`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      endDay
    ).padStart(2, "0")}`;

    const config: SlotSeedConfig = {
      startDate,
      endDate,
      weekdays: body.weekdays ?? [1, 2, 3, 4], // Mon–Thu
      startHour: body.startHour ?? 11,
      endHour: body.endHour ?? 16,
      durationMinutes: body.durationMinutes ?? 30,
      price: body.price ?? 555,
      meetingLink: body.meetingLink,
    };

    const result = await seedConsultationSlots(config);

    return NextResponse.json<SeedSlotsResponse>({
      success: true,
      ...result,
      appliedConfig: config,
    });
  } catch (err) {
    console.error("[admin/seed-slots] error:", err);
    const message = err instanceof Error ? err.message : "Failed to seed slots";
    return NextResponse.json<SeedSlotsResponse>(
      { success: false, error: message, created: 0, skippedExisting: 0, days: 0, slotsPerDay: 0, errors: [] },
      { status: 500 }
    );
  }
}
