"use client";

import { useState } from "react";
import { PageShell } from "@/components/app-shell/page-shell";
import {
  KALARI_DURATIONS,
  KALARI_FEATURE_MATRIX,
  getKalariPrice,
  getKalariPerDayPrice,
  type KalariMode,
} from "@/lib/kalari-pricing";

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) return <span className="font-bold text-green-600">✓</span>;
  if (value === false) return <span className="text-tattvam-purple-300">✗</span>;
  return <span className="text-xs font-semibold text-tattvam-gold-700">{value}</span>;
}

export default function KalaripayattuPricingPage() {
  const [mode, setMode] = useState<KalariMode>("offline");

  return (
    <PageShell
      eyebrow="Kalari Payattu"
      title="Kalari Payattu Program Pricing"
      description="Choose your training mode and duration. Online includes a 20% discount off the regular offline price."
    >
      {/* Mode toggle */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-tattvam-purple-200 bg-tattvam-purple-50 p-1">
          {(["offline", "online"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${
                mode === m
                  ? "bg-tattvam-purple-600 text-white"
                  : "text-tattvam-purple-600 hover:text-tattvam-purple-800"
              }`}
            >
              {m === "offline" ? "Offline" : "Online"}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing table */}
      <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
        <table className="w-full min-w-[520px] text-center text-sm">
          <thead>
            <tr className="bg-tattvam-purple-50">
              <th className="px-4 py-4 text-left font-semibold text-tattvam-purple-800">
                Duration
              </th>
              <th className="px-4 py-4 font-semibold text-tattvam-purple-800">
                {mode === "online" ? "Online (20% OFF)" : "Offline (Regular Price)"}
              </th>
              <th className="px-4 py-4 font-semibold text-tattvam-purple-800">
                Per Day
              </th>
            </tr>
          </thead>
          <tbody>
            {KALARI_DURATIONS.map((months) => {
              const price = getKalariPrice(months, mode);
              const perDay = getKalariPerDayPrice(months, mode);
              return (
                <tr key={months} className="border-t border-tattvam-purple-100">
                  <td className="px-4 py-4 text-left font-medium text-tattvam-purple-800">
                    {months} Month{months > 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-4 text-tattvam-purple-900">
                    <span className="text-lg font-bold">₹{price.toLocaleString("en-IN")}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-tattvam-purple-500">
                    ₹{perDay.toLocaleString("en-IN")}/day
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-tattvam-purple-400">
        {mode === "online" ? "Online pricing includes a 20% discount." : "Offline pricing is the regular in-person rate."}
      </p>

      {/* What's Included */}
      <h3 className="mt-10 font-serif text-lg font-bold text-tattvam-purple-900">
        What&apos;s Included
      </h3>
      <div className="mt-3 overflow-x-auto rounded-xl border border-tattvam-purple-100">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="bg-tattvam-purple-50">
              <th className="px-4 py-3 text-left font-semibold text-tattvam-purple-800">
                Feature
              </th>
              <th className="px-4 py-3 text-center font-semibold text-tattvam-purple-700">
                Online
              </th>
              <th className="px-4 py-3 text-center font-semibold text-tattvam-gold-700">
                Offline
              </th>
            </tr>
          </thead>
          <tbody>
            {KALARI_FEATURE_MATRIX.map((row) => (
              <tr key={row.feature} className="border-t border-tattvam-purple-100">
                <td className="px-4 py-2.5 text-left text-tattvam-purple-800">
                  {row.feature}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <FeatureValue value={row.online} />
                </td>
                <td className="px-4 py-2.5 text-center">
                  <FeatureValue value={row.offline} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl bg-tattvam-purple-900 p-8 text-center">
        <h3 className="font-serif text-2xl font-bold text-white">
          Begin Your Kalari Journey
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-purple-100/80">
          Train in the ancient art of Kalari Payattu. Choose online convenience or immersive offline training.
        </p>
        <a
          href="https://wa.me/916363606088"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-6 inline-flex"
        >
          Enquire on WhatsApp
          <span className="ml-2">→</span>
        </a>
      </div>
    </PageShell>
  );
}
