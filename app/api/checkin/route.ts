export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function todayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export interface WellnessCheckinRecord {
  id?: string;
  userId: string;
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  gratitude: string;
  createdAt?: string | null;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decoded: { uid: string };
    try {
      decoded = await getAdminAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const snap = await getAdminDb()
      .collection("wellnessCheckins")
      .where("userId", "==", decoded.uid)
      .get();

    const checkins: WellnessCheckinRecord[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId || decoded.uid,
        date: data.date || "",
        mood: Number(data.mood) || 3,
        energy: Number(data.energy) || 3,
        sleep: Number(data.sleep) || 3,
        gratitude: data.gratitude || "",
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      };
    });

    // Sort newest first by date
    checkins.sort((a, b) => b.date.localeCompare(a.date));

    const today = todayKey();
    const todayEntry = checkins.find((c) => c.date === today) || null;

    return NextResponse.json({
      success: true,
      today: todayEntry,
      history: checkins,
    });
  } catch (err) {
    console.error("[api/checkin GET] error:", err);
    const message = err instanceof Error ? err.message : "Failed to load check-ins";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decoded: { uid: string };
    try {
      decoded = await getAdminAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { mood, energy, sleep, gratitude } = body;

    const moodNum = Number(mood);
    const energyNum = Number(energy);
    const sleepNum = Number(sleep);

    if (
      isNaN(moodNum) ||
      moodNum < 1 ||
      moodNum > 5 ||
      isNaN(energyNum) ||
      energyNum < 1 ||
      energyNum > 5 ||
      isNaN(sleepNum) ||
      sleepNum < 1 ||
      sleepNum > 5
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid scale ratings. Values must be between 1 and 5." },
        { status: 400 }
      );
    }

    const date = body.date || todayKey();
    const gratitudeText = typeof gratitude === "string" ? gratitude.trim() : "";

    const ref = await getAdminDb().collection("wellnessCheckins").add({
      userId: decoded.uid,
      date,
      mood: moodNum,
      energy: energyNum,
      sleep: sleepNum,
      gratitude: gratitudeText,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      checkinId: ref.id,
    });
  } catch (err) {
    console.error("[api/checkin POST] error:", err);
    const message = err instanceof Error ? err.message : "Failed to save check-in";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
