"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  addCheckin,
  getCheckinsByUser,
  getTodayCheckin,
  todayKey,
  type WellnessCheckin,
} from "@/lib/db/wellness-checkins";

const SCALE_LABELS: Record<string, string[]> = {
  mood: ["😞", "😕", "😐", "🙂", "😄"],
  energy: ["🪫", "😴", "🙂", "⚡", "🔥"],
  sleep: ["💤", "🥱", "😐", "😌", "🌟"],
};

function ScalePicker({
  label,
  kind,
  value,
  onChange,
}: {
  label: string;
  kind: keyof typeof SCALE_LABELS;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-tattvam-purple-700">{label}</p>
      <div className="mt-1 flex gap-2">
        {SCALE_LABELS[kind].map((emoji, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
              value === i + 1
                ? "border-tattvam-purple-500 bg-tattvam-purple-100"
                : "border-tattvam-purple-200 bg-white hover:bg-tattvam-purple-50"
            }`}
            aria-label={`${label} ${i + 1}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function TrendChart({
  title,
  values,
  color,
}: {
  title: string;
  values: number[]; // oldest → newest, 1-5
  color: string;
}) {
  if (values.length < 2) return null;
  const w = 260;
  const h = 60;
  const pad = 8;
  const stepX = (w - pad * 2) / (values.length - 1);
  const y = (v: number) => h - pad - ((v - 1) / 4) * (h - pad * 2);
  const points = values.map((v, i) => `${pad + i * stepX},${y(v)}`).join(" ");

  return (
    <div className="rounded-xl bg-tattvam-purple-50 p-3">
      <p className="text-xs font-medium text-tattvam-purple-600">{title}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 w-full">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
        {values.map((v, i) => (
          <circle key={i} cx={pad + i * stepX} cy={y(v)} r="2.5" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-tattvam-purple-400">
        <span>oldest</span>
        <span>latest: {values[values.length - 1]}/5</span>
      </div>
    </div>
  );
}

export function DailyCheckin({ userId }: { userId: string }) {
  const { firebaseUser } = useAuth();
  const [todayEntry, setTodayEntry] = useState<WellnessCheckin | null>(null);
  const [history, setHistory] = useState<WellnessCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [gratitude, setGratitude] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const [today, all] = await Promise.all([
        getTodayCheckin(userId, token),
        getCheckinsByUser(userId, token),
      ]);
      setTodayEntry(today);
      setHistory(all);
    } catch (e) {
      console.error("Failed to load check-ins:", e);
    } finally {
      setIsLoading(false);
    }
  }, [userId, firebaseUser]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const token = await firebaseUser?.getIdToken();
      await addCheckin(
        { userId, date: todayKey(), mood, energy, sleep, gratitude: gratitude.trim() },
        token
      );
      setMessage({ text: "Check-in saved. Have a mindful day! 🌿", isError: false });
      setTimeout(() => setMessage(null), 5000);
      await load();
    } catch (err) {
      console.error("Save checkin failed:", err);
      const errText = err instanceof Error ? err.message : "Could not save your check-in. Please try again.";
      setMessage({ text: errText, isError: true });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return null;

  const recent = history.slice(0, 14).reverse(); // oldest → newest
  const recentList = history.slice(0, 7);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Daily Wellness Check-in</h2>

      {message && (
        <p
          className={`mt-3 rounded-xl px-4 py-2 text-sm font-medium ${
            message.isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </p>
      )}

      {!todayEntry ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-6">
            <ScalePicker label="How is your mood?" kind="mood" value={mood} onChange={setMood} />
            <ScalePicker label="Energy level" kind="energy" value={energy} onChange={setEnergy} />
            <ScalePicker label="How did you sleep?" kind="sleep" value={sleep} onChange={setSleep} />
          </div>
          <div>
            <label className="text-sm font-medium text-tattvam-purple-700">
              One thing you are grateful for today
            </label>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              rows={2}
              required
              className="mt-1 w-full rounded-xl border border-tattvam-purple-200 px-4 py-2.5 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
            {saving ? "Saving..." : "Submit Check-in"}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-tattvam-purple-600">
          ✅ Checked in today — mood {todayEntry.mood}/5, energy {todayEntry.energy}/5, sleep{" "}
          {todayEntry.sleep}/5.
        </p>
      )}

      {recent.length >= 2 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <TrendChart title="Mood trend" values={recent.map((c) => c.mood)} color="#7c3aed" />
          <TrendChart title="Energy trend" values={recent.map((c) => c.energy)} color="#d97706" />
          <TrendChart title="Sleep trend" values={recent.map((c) => c.sleep)} color="#059669" />
        </div>
      )}

      {recentList.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-tattvam-purple-800">Recent check-ins</h3>
          <ul className="mt-2 space-y-2">
            {recentList.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-tattvam-purple-50 px-4 py-2 text-sm text-tattvam-purple-700"
              >
                <span className="font-medium">{c.date}</span>
                <span>😊 {c.mood}/5</span>
                <span>⚡ {c.energy}/5</span>
                <span>💤 {c.sleep}/5</span>
                {c.gratitude && <span className="text-tattvam-purple-500">“{c.gratitude}”</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
