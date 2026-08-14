"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/app-shell/page-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { MembershipPayButton } from "@/components/payments/membership-pay-button";
import {
  FEATURE_MATRIX,
  MEMBERSHIP_DURATIONS,
  TIER_META,
  getMembershipPrice,
  type FeatureCell,
  type MembershipMode,
  type MembershipTier,
} from "@/lib/membership-pricing";

const TIERS: MembershipTier[] = ["RISE", "INNER CIRCLE"];

const TIER_DESCRIPTIONS: Record<MembershipTier, string> = {
  RISE: "Transformation Level — Shift patterns. Experience real change.",
  "INNER CIRCLE": "Premium — Your life, guided personally",
};

interface Selection {
  tier: MembershipTier;
  months: number;
}

function FeatureValue({ value }: { value: FeatureCell }) {
  if (value === true) return <span className="font-bold text-green-600">✓</span>;
  if (value === false) return <span className="text-tattvam-purple-300">✗</span>;
  return <span className="text-xs font-semibold text-tattvam-gold-700">{value}</span>;
}

export default function ProjectAnandaPricingPage() {
  const { firebaseUser, profile } = useAuth();
  const router = useRouter();
  const [modalTier, setModalTier] = useState<MembershipTier | null>(null);
  const [mode, setMode] = useState<MembershipMode>("offline");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    plan?: string;
    duration?: number;
    mode?: MembershipMode;
  }>({});

  function openPlans(tier: MembershipTier) {
    setModalTier(tier);
    setSelection(null);
  }

  function closeModal() {
    setModalTier(null);
    setSelection(null);
  }

  function handleSuccess(sel: Selection) {
    setPaymentDetails({ plan: TIER_META[sel.tier].name, duration: sel.months, mode });
    setPaymentSuccess(true);
    closeModal();
  }

  if (paymentSuccess) {
    return (
      <PageShell
        eyebrow="Project Ananda"
        title="Payment Successful"
        description="Thank you for joining Project Ananda."
      >
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-soft">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl text-green-600">✓</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
            Payment Successful
          </h2>
          <p className="mt-4 text-tattvam-purple-600">
            Thank you for joining Project Ananda.
          </p>
          <p className="mt-2 text-sm text-tattvam-purple-500">
            A confirmation has been sent to your registered email and mobile number.
          </p>
          {paymentDetails.plan && (
            <div className="mt-6 rounded-xl bg-tattvam-purple-50 p-4">
              <p className="text-sm text-tattvam-purple-700">
                <span className="font-medium">Plan:</span> {paymentDetails.plan}
              </p>
              <p className="text-sm text-tattvam-purple-700">
                <span className="font-medium">Duration:</span> {paymentDetails.duration} Month
                {paymentDetails.duration! > 1 ? "s" : ""}
              </p>
              {paymentDetails.mode && (
                <p className="text-sm text-tattvam-purple-700">
                  <span className="font-medium">Mode:</span>{" "}
                  {paymentDetails.mode === "online" ? "Online" : "Offline"}
                </p>
              )}
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push("/profile")}
              className="btn-primary inline-flex justify-center"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => {
                setPaymentSuccess(false);
                setPaymentDetails({});
              }}
              className="btn-secondary inline-flex justify-center"
            >
              Done
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Project Ananda"
      title="Choose Your Membership"
      description="Select the membership that best suits your journey."
    >
      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const meta = TIER_META[tier];
          return (
            <div
              key={tier}
              className={`relative flex h-full flex-col rounded-3xl p-8 ${
                meta.recommended
                  ? "border-2 border-tattvam-gold-400 bg-gradient-to-b from-tattvam-purple-800 to-tattvam-purple-900"
                  : "bg-white shadow-soft"
              }`}
            >
              {meta.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-tattvam-gold-400 px-4 py-1 text-xs font-bold text-tattvam-purple-900">
                  Most Recommended
                </div>
              )}
              <h3
                className={`font-serif text-2xl font-semibold ${
                  meta.recommended ? "text-tattvam-gold-400" : "text-tattvam-purple-900"
                }`}
              >
                {meta.name}
              </h3>
              <p
                className={`mt-2 text-sm font-medium ${
                  meta.recommended ? "text-tattvam-purple-300" : "text-tattvam-purple-500"
                }`}
              >
                {TIER_DESCRIPTIONS[tier]}
              </p>
              <p
                className={`mt-4 text-sm ${
                  meta.recommended ? "text-purple-100/80" : "text-tattvam-purple-600/70"
                }`}
              >
                Starting at ₹
                {getMembershipPrice(tier, 1, "online").toLocaleString("en-IN")}
                /month (online)
              </p>
              <div className="mt-auto pt-8">
                <button
                  onClick={() => openPlans(tier)}
                  className={
                    meta.recommended
                      ? "btn-primary block w-full text-center"
                      : "btn-secondary block w-full text-center"
                  }
                >
                  View Plans
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plans + Payment Modal */}
      {modalTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="relative max-h-[90vh] w-[min(100vw-1.5rem,56rem)] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 text-tattvam-purple-400 hover:text-tattvam-purple-700"
              aria-label="Close modal"
            >
              ✕
            </button>

            {!selection ? (
              <>
                {/* ─── Step 1: Pricing plans + feature list ─── */}
                <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
                  Choose Your Plan
                </h2>
                <p className="mt-1 text-sm text-tattvam-purple-500">
                  Compare durations and features, then tap a price to continue.
                </p>

                {/* Mode toggle */}
                <div className="mt-5 inline-flex rounded-full border border-tattvam-purple-200 bg-tattvam-purple-50 p-1">
                  {(["offline", "online"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                        mode === m
                          ? "bg-tattvam-purple-600 text-white"
                          : "text-tattvam-purple-600 hover:text-tattvam-purple-800"
                      }`}
                    >
                      {m === "offline" ? "Offline" : "Online"}
                    </button>
                  ))}
                </div>

                {/* Pricing table */}
                <div className="mt-4 overflow-x-auto rounded-xl border border-tattvam-purple-100">
                  <table className="w-full min-w-[520px] text-center text-sm">
                    <thead>
                      <tr className="bg-tattvam-purple-50">
                        <th className="px-4 py-3 text-left font-semibold text-tattvam-purple-800">
                          Duration
                        </th>
                        {TIERS.map((tier) => (
                          <th
                            key={tier}
                            className={`px-4 py-3 font-semibold ${
                              tier === modalTier
                                ? "bg-tattvam-gold-100 text-tattvam-purple-900"
                                : "text-tattvam-purple-700"
                            }`}
                          >
                            <div>{TIER_META[tier].name.replace("Ananda ", "")}</div>
                            {tier === "RISE" && (
                              <div className="text-[10px] font-medium text-tattvam-gold-700">
                                (Most Recommended)
                              </div>
                            )}
                            {tier === "INNER CIRCLE" && (
                              <div className="text-[10px] font-medium text-tattvam-gold-700">
                                (Premium Feel)
                              </div>
                            )}
                            <div className="text-xs font-normal italic text-tattvam-purple-500">
                              {TIER_META[tier].tagline}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MEMBERSHIP_DURATIONS.map((months) => (
                        <tr key={months} className="border-t border-tattvam-purple-100">
                          <td className="px-4 py-3 text-left font-medium text-tattvam-purple-800">
                            {months} Month{months > 1 ? "s" : ""}
                          </td>
                          {TIERS.map((tier) => {
                            const price = getMembershipPrice(tier, months, mode);
                            const perDay = Math.round(price / (months * 30));
                            return (
                              <td
                                key={tier}
                                className={`px-4 py-3 ${
                                  tier === modalTier ? "bg-tattvam-gold-50" : ""
                                }`}
                              >
                                <button
                                  onClick={() => setSelection({ tier, months })}
                                  className="group mx-auto block w-full rounded-lg px-2 py-1 transition hover:bg-tattvam-purple-100"
                                >
                                  <span className="block font-bold text-tattvam-purple-900 group-hover:text-tattvam-purple-700">
                                    ₹{price.toLocaleString("en-IN")}
                                  </span>
                                  <span className="block text-xs text-tattvam-purple-500">
                                    ₹{perDay.toLocaleString("en-IN")}/day
                                  </span>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-tattvam-purple-400">
                  {mode === "offline" ? "Offline" : "Online"} pricing shown. Tap any price to
                  proceed to payment.
                </p>

                {/* Feature list */}
                <h3 className="mt-8 font-serif text-lg font-bold text-tattvam-purple-900">
                  What&apos;s Included
                </h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-tattvam-purple-100">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="bg-tattvam-purple-50">
                        <th className="px-4 py-3 text-left font-semibold text-tattvam-purple-800">
                          Feature
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-tattvam-gold-700">
                          Rise
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-tattvam-purple-700">
                          Inner Circle
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {FEATURE_MATRIX.map((row) => (
                        <tr key={row.feature} className="border-t border-tattvam-purple-100">
                          <td className="px-4 py-2.5 text-left text-tattvam-purple-800">
                            {row.feature}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <FeatureValue value={row.rise} />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <FeatureValue value={row.innerCircle} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                {/* ─── Step 2: Payment ─── */}
                <button
                  onClick={() => setSelection(null)}
                  className="mb-4 text-sm font-medium text-tattvam-purple-500 transition hover:text-tattvam-purple-800"
                >
                  ← Back to plans
                </button>
                <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
                  {TIER_META[selection.tier].name}
                </h2>
                <p className="mt-1 text-sm text-tattvam-purple-500">
                  {TIER_DESCRIPTIONS[selection.tier]}
                </p>

                <div className="mx-auto mt-6 max-w-md rounded-xl border border-tattvam-purple-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-tattvam-purple-800">
                        {selection.months} Month{selection.months > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-tattvam-purple-500">
                        {mode === "online" ? "Online" : "Offline"} membership
                      </p>
                      <p className="mt-1 text-xl font-bold text-tattvam-gold-600">
                        ₹
                        {getMembershipPrice(selection.tier, selection.months, mode).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    {firebaseUser ? (
                      <MembershipPayButton
                        membershipType={selection.tier}
                        durationMonths={selection.months}
                        mode={mode}
                        userId={firebaseUser.uid}
                        customerName={profile?.name || firebaseUser.displayName || ""}
                        customerEmail={profile?.email || firebaseUser.email || ""}
                        onSuccess={() => handleSuccess(selection)}
                      />
                    ) : (
                      <button
                        onClick={() => router.push("/")}
                        className="btn-primary w-full text-sm"
                      >
                        Log in to Pay
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
