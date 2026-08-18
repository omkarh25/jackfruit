"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/app-shell/page-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { MembershipPayButton } from "@/components/payments/membership-pay-button";
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

interface Selection {
  months: number;
}

export default function KalaripayattuPricingPage() {
  const { firebaseUser, profile } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<KalariMode>("offline");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    duration?: number;
    mode?: KalariMode;
  }>({});

  function closeModal() {
    setSelection(null);
  }

  function handleSuccess(sel: Selection) {
    setPaymentDetails({ duration: sel.months, mode });
    setPaymentSuccess(true);
    closeModal();
  }

  if (paymentSuccess) {
    return (
      <PageShell
        eyebrow="Kalari Payattu"
        title="Payment Successful"
        description="Thank you for joining the Kalari Payattu Program."
      >
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-soft">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl text-green-600">✓</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
            Payment Successful
          </h2>
          <p className="mt-4 text-tattvam-purple-600">
            Thank you for enrolling in the Kalari Payattu Program.
          </p>
          <p className="mt-2 text-sm text-tattvam-purple-500">
            A confirmation has been sent to your registered email and mobile number.
          </p>
          {paymentDetails.duration && (
            <div className="mt-6 rounded-xl bg-tattvam-purple-50 p-4 text-left">
              <p className="text-sm text-tattvam-purple-700">
                <span className="font-medium">Program:</span> Kalari Payattu
              </p>
              <p className="text-sm text-tattvam-purple-700">
                <span className="font-medium">Duration:</span> {paymentDetails.duration} Month
                {paymentDetails.duration > 1 ? "s" : ""}
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
                <tr
                  key={months}
                  className="border-t border-tattvam-purple-100 transition hover:bg-tattvam-purple-50/50"
                >
                  <td className="px-4 py-4 text-left font-medium text-tattvam-purple-800">
                    {months} Month{months > 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-4 text-tattvam-purple-900">
                    <button
                      onClick={() => setSelection({ months })}
                      className="group mx-auto block rounded-lg px-3 py-1.5 transition hover:bg-tattvam-purple-100 focus:outline-none focus:ring-2 focus:ring-tattvam-purple-500"
                      title="Click to select this plan"
                    >
                      <span className="block text-lg font-bold text-tattvam-purple-900 group-hover:text-tattvam-purple-700">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      <span className="block text-xs font-semibold text-tattvam-gold-600">
                        Select & Pay →
                      </span>
                    </button>
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
        {mode === "online"
          ? "Online pricing includes a 20% discount. Tap any price to proceed to payment."
          : "Offline pricing is the regular in-person rate. Tap any price to proceed to payment."}
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

      {/* Payment Modal */}
      {selection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="relative max-h-[90vh] w-[min(100vw-1.5rem,32rem)] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 text-tattvam-purple-400 hover:text-tattvam-purple-700"
              aria-label="Close modal"
            >
              ✕
            </button>

            <button
              onClick={closeModal}
              className="mb-4 text-sm font-medium text-tattvam-purple-500 transition hover:text-tattvam-purple-800"
            >
              ← Back to plans
            </button>

            <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
              Kalari Payattu — {selection.months} Month{selection.months > 1 ? "s" : ""}
            </h2>
            <p className="mt-1 text-sm text-tattvam-purple-500">
              {mode === "online" ? "Online Training" : "Offline Training in the Kalari"}
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-xl border border-tattvam-purple-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-tattvam-purple-800">
                    {selection.months} Month{selection.months > 1 ? "s" : ""} ({mode === "online" ? "Online" : "Offline"})
                  </p>
                  <p className="text-xs text-tattvam-purple-500">
                    ₹{getKalariPerDayPrice(selection.months, mode).toLocaleString("en-IN")}/day
                  </p>
                  <p className="mt-1 text-xl font-bold text-tattvam-gold-600">
                    ₹{getKalariPrice(selection.months, mode).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {firebaseUser ? (
                  <MembershipPayButton
                    membershipType="Kalari Payattu"
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
          </div>
        </div>
      )}
    </PageShell>
  );
}
