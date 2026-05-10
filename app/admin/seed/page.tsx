"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { seedAll } from "@/lib/db/seed";

export default function AdminSeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult("");
    try {
      await seedAll();
      setResult("✅ Seed completed successfully! Check your Firestore console.");
    } catch (err) {
      setResult(`❌ Seed failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <AdminShell
      title="Seed Firestore Data"
      subtitle="Push initial services, workshops, courses, and testimonials into Firestore"
    >
      <div className="rounded-2xl bg-white p-10 shadow-soft text-center max-w-2xl mx-auto">
        <p className="text-5xl mb-6">🌱</p>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
          Seed Initial Data
        </h2>
        <p className="mt-4 text-tattvam-purple-600/70">
          This will push all current static data (services, workshops, courses, testimonials)
          from <code className="bg-tattvam-purple-50 px-2 py-1 rounded text-sm">lib/data.ts</code> into your Firestore database.
        </p>
        <p className="mt-2 text-sm text-tattvam-purple-400">
          Only run this once — duplicate data may be created if run multiple times.
        </p>

        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="btn-primary mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSeeding ? "Seeding..." : "🚀 Seed Firestore Database"}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${
            result.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {result}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
