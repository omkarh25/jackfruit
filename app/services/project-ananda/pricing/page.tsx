"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/app-shell/page-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { MembershipPayButton } from "@/components/payments/membership-pay-button";

interface PlanOption {
  months: number;
  price: number;
}

interface MembershipPlan {
  key: "FLOW" | "RISE" | "INNER CIRCLE";
  name: string;
  badge?: string;
  description: string;
  options: PlanOption[];
}

const PLANS: MembershipPlan[] = [
  {
    key: "FLOW",
    name: "Ananda Flow",
    description: "Entry Level — Get your body and energy moving",
    options: [
      { months: 1, price: 2200 },
      { months: 3, price: 6000 },
      { months: 6, price: 11000 },
      { months: 12, price: 20000 },
    ],
  },
  {
    key: "RISE",
    name: "Ananda Rise",
    badge: "Most Popular",
    description: "Transformation Level — Shift patterns. Experience real change.",
    options: [
      { months: 1, price: 4500 },
      { months: 3, price: 12500 },
      { months: 6, price: 24000 },
      { months: 12, price: 44000 },
    ],
  },
  {
    key: "INNER CIRCLE",
    name: "Ananda Inner Circle",
    description: "Premium — Your life, guided personally",
    options: [
      { months: 1, price: 9000 },
      { months: 3, price: 25000 },
      { months: 6, price: 48000 },
      { months: 12, price: 88000 },
    ],
  },
];

export default function ProjectAnandaPricingPage() {
  const { firebaseUser, profile } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{ plan?: string; duration?: number }>({});

  function handleSuccess(plan: MembershipPlan, months: number) {
    setPaymentDetails({ plan: plan.name, duration: months });
    setPaymentSuccess(true);
    setSelectedPlan(null);
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
                <span className="font-medium">Duration:</span> {paymentDetails.duration} Month{paymentDetails.duration! > 1 ? "s" : ""}
              </p>
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push("/profile")}
              className="btn-primary inline-flex justify-center"
            >
              Go to My Profile
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
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`relative flex h-full flex-col rounded-3xl p-8 ${
              plan.badge
                ? "border-2 border-tattvam-gold-400 bg-gradient-to-b from-tattvam-purple-800 to-tattvam-purple-900"
                : "bg-white shadow-soft"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-tattvam-gold-400 px-4 py-1 text-xs font-bold text-tattvam-purple-900">
                {plan.badge}
              </div>
            )}
            <h3
              className={`font-serif text-2xl font-semibold ${
                plan.badge ? "text-tattvam-gold-400" : "text-tattvam-purple-900"
              }`}
            >
              {plan.name}
            </h3>
            <p
              className={`mt-2 text-sm font-medium ${
                plan.badge ? "text-tattvam-purple-300" : "text-tattvam-purple-500"
              }`}
            >
              {plan.description}
            </p>
            <div className="mt-auto pt-8">
              <button
                onClick={() => setSelectedPlan(plan)}
                className={
                  plan.badge
                    ? "btn-primary block w-full text-center"
                    : "btn-secondary block w-full text-center"
                }
              >
                View Plans
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute right-4 top-4 text-tattvam-purple-400 hover:text-tattvam-purple-700"
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
              {selectedPlan.name}
            </h2>
            <p className="mt-1 text-sm text-tattvam-purple-500">
              {selectedPlan.description}
            </p>

            <div className="mt-6 space-y-3">
              {selectedPlan.options.map((option) => (
                <div
                  key={option.months}
                  className="flex items-center justify-between rounded-xl border border-tattvam-purple-100 p-4"
                >
                  <div>
                    <p className="font-medium text-tattvam-purple-800">
                      {option.months} Month{option.months > 1 ? "s" : ""}
                    </p>
                    <p className="text-lg font-bold text-tattvam-gold-600">
                      ₹{option.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {firebaseUser ? (
                    <MembershipPayButton
                      membershipType={selectedPlan.key}
                      durationMonths={option.months}
                      userId={firebaseUser.uid}
                      customerName={profile?.name || firebaseUser.displayName || ""}
                      customerEmail={profile?.email || firebaseUser.email || ""}
                      onSuccess={() => handleSuccess(selectedPlan, option.months)}
                    />
                  ) : (
                    <button
                      onClick={() => router.push("/")}
                      className="btn-primary text-sm"
                    >
                      Log in to Pay
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
