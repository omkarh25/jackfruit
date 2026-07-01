"use client";

import { useState } from "react";
import { LOGGER } from "@/lib/logger";

export type CouponApplierItemType =
  | "course"
  | "workshop"
  | "service"
  | "consultation"
  | "membership";

export interface AppliedCouponDetails {
  couponCode: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}

export interface CouponApplierProps {
  originalAmount: number;
  itemType: CouponApplierItemType;
  itemId: string;
  membershipType?: string;
  onApply?: (details: AppliedCouponDetails) => void;
  onRemove?: () => void;
  className?: string;
}

function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function CouponApplier({
  originalAmount,
  itemType,
  itemId,
  membershipType,
  onApply,
  onRemove,
  className = "",
}: CouponApplierProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<AppliedCouponDetails | null>(null);

  async function handleApply() {
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter a coupon code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmed,
          itemType,
          itemId,
          originalAmount,
          membershipType,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error || "Invalid coupon code");
        return;
      }

      const details: AppliedCouponDetails = {
        couponCode: data.couponCode,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
      };

      setApplied(details);
      onApply?.(details);
    } catch (err) {
      LOGGER.error("Failed to apply coupon", { error: String(err) });
      setError("Could not validate coupon. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setApplied(null);
    setCode("");
    setError(null);
    onRemove?.();
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {!applied ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            disabled={loading}
            className="flex-1 rounded-xl border border-tattvam-purple-200 bg-white px-4 py-2 text-sm uppercase text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="rounded-xl bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-700 transition hover:bg-tattvam-purple-200 disabled:opacity-60"
          >
            {loading ? "Applying…" : "Apply Coupon"}
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-green-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-green-700">
              Coupon <span className="uppercase">{applied.couponCode}</span> applied
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {applied && (
        <div className="space-y-1 rounded-xl bg-tattvam-purple-50 p-3 text-sm">
          <div className="flex justify-between text-tattvam-purple-700">
            <span>Original Amount</span>
            <span className="font-medium">{formatCurrency(originalAmount)}</span>
          </div>
          <div className="flex justify-between text-tattvam-purple-700">
            <span>
              Discount ({applied.discountValue}
              {applied.discountType === "percentage" ? "%" : ""})
            </span>
            <span className="font-medium text-green-700">
              −{formatCurrency(applied.discountAmount)}
            </span>
          </div>
          <div className="flex justify-between border-t border-tattvam-purple-200 pt-1 text-tattvam-purple-900">
            <span className="font-semibold">Final Payable</span>
            <span className="font-bold text-tattvam-gold-600">
              {formatCurrency(applied.finalAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
