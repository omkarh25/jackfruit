import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Configuration for bulk-creating consultation slots. Pure data — safe to
 * import from both client components and API routes.
 */
export interface SlotSeedConfig {
  /** Inclusive start date, formatted YYYY-MM-DD. */
  startDate: string;
  /** Inclusive end date, formatted YYYY-MM-DD. */
  endDate: string;
  /** Days of the week to generate slots for (0 = Sunday, 1 = Monday …). */
  weekdays: number[];
  /** Start hour in 24-hour time (0-23). */
  startHour: number;
  /** End hour in 24-hour time (1-24). The last slot ends at this hour. */
  endHour: number;
  /** Slot length in minutes. */
  durationMinutes: number;
  /** Price per slot, in rupees. */
  price: number;
  /** Optional meeting link copied onto every slot. */
  meetingLink?: string;
}

/**
 * Result of a seed operation.
 */
export interface SlotSeedResult {
  created: number;
  skippedExisting: number;
  days: number;
  slotsPerDay: number;
  errors: string[];
}

/**
 * Generates a list of slot records for the given configuration. Pure function —
 * performs no I/O. Callers iterate the result and write to Firestore.
 */
export function planSlots(config: SlotSeedConfig): Array<{
  date: string;
  time: string;
}> {
  const slots: Array<{ date: string; time: string }> = [];
  const start = new Date(`${config.startDate}T00:00:00`);
  const end = new Date(`${config.endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid startDate or endDate for slot seeding");
  }
  if (end < start) {
    throw new Error("endDate must be on or after startDate");
  }
  if (config.durationMinutes <= 0 || config.durationMinutes > 240) {
    throw new Error("durationMinutes must be between 1 and 240");
  }
  if (config.startHour < 0 || config.endHour > 24 || config.endHour <= config.startHour) {
    throw new Error("Invalid startHour/endHour range");
  }

  const stepMs = config.durationMinutes * 60 * 1000;
  const startMs = start.getTime();
  const endMs = end.getTime();

  for (let day = startMs; day <= endMs; day += 24 * 60 * 60 * 1000) {
    const date = new Date(day);
    const dow = date.getDay();
    if (!config.weekdays.includes(dow)) continue;

    // Anchor the day's first slot exactly at startHour:00.
    let t = new Date(date);
    t.setHours(config.startHour, 0, 0, 0);

    while (t.getTime() < day + 24 * 60 * 60 * 1000) {
      const startOfSlot = t.getHours() + t.getMinutes() / 60;
      // Bail if the next slot would end past endHour.
      if (startOfSlot + config.durationMinutes / 60 > config.endHour) break;

      const hh = String(t.getHours()).padStart(2, "0");
      const mm = String(t.getMinutes()).padStart(2, "0");
      const dateStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
        t.getDate()
      ).padStart(2, "0")}`;
      slots.push({ date: dateStr, time: `${hh}:${mm}` });

      t = new Date(t.getTime() + stepMs);
    }
  }

  return slots;
}

/**
 * Counts the number of unique dates in a plan — useful for the response body.
 */
export function countUniqueDates(plan: Array<{ date: string }>): number {
  return new Set(plan.map((s) => s.date)).size;
}

/**
 * Server-side helper: creates the slots in Firestore via the Admin SDK,
 * skipping any slots that already exist for the same date+time.
 *
 * Idempotent: re-running on the same range will not create duplicate slots.
 */
export async function seedConsultationSlots(
  config: SlotSeedConfig
): Promise<SlotSeedResult> {
  const plan = planSlots(config);
  const db = getAdminDb();
  const errors: string[] = [];
  let created = 0;
  let skippedExisting = 0;

  // Fetch all existing slots once for the date range (so the dedupe check is
  // O(n) rather than O(n) round-trips). For very large ranges the caller can
  // pass in a narrower window.
  const existingQuery = await db
    .collection("slots")
    .where("date", ">=", config.startDate)
    .where("date", "<=", config.endDate)
    .get();
  const existingKeys = new Set<string>();
  existingQuery.forEach((doc) => {
    const data = doc.data();
    if (data.date && data.time) existingKeys.add(`${data.date}|${data.time}`);
  });

  // Friendly duration label — matches the existing slot dropdown options.
  const label =
    config.durationMinutes === 30
      ? "30 min"
      : config.durationMinutes === 60
      ? "60 min"
      : config.durationMinutes === 90
      ? "90 min"
      : config.durationMinutes === 120
      ? "120 min"
      : `${config.durationMinutes} min`;

  for (const slot of plan) {
    const key = `${slot.date}|${slot.time}`;
    if (existingKeys.has(key)) {
      skippedExisting++;
      continue;
    }
    try {
      await db.collection("slots").add({
        date: slot.date,
        time: slot.time,
        duration: label,
        price: config.price,
        meetingLink: config.meetingLink ?? "",
        status: "available",
        bookedBy: null,
        heldAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      created++;
    } catch (err) {
      errors.push(
        `${slot.date} ${slot.time}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Compute per-day count for the response.
  const perDayCounts: Record<string, number> = {};
  plan.forEach((s) => {
    perDayCounts[s.date] = (perDayCounts[s.date] ?? 0) + 1;
  });

  return {
    created,
    skippedExisting,
    days: Object.keys(perDayCounts).length,
    slotsPerDay: plan.length > 0 ? Math.max(...Object.values(perDayCounts)) : 0,
    errors,
  };
}
