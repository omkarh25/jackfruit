"use client";

import { useState } from "react";
import { createRazorpayInstance } from "@/lib/razorpay-client";
import { LOGGER } from "@/lib/logger";
import {
  getMembershipPrice,
  type MembershipMode,
  type MembershipTier,
} from "@/lib/membership-pricing";
import { PaymentFailedModal } from "./payment-failed-modal";
import { CouponApplier, type AppliedCouponDetails } from "./coupon-applier";

export interface MembershipPayButtonProps {
  membershipType: MembershipTier;
  durationMonths: number;
  mode: MembershipMode;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  couponCode?: string;
  onSuccess?: (paymentId: string, razorpayPaymentId: string) => void;
  onFailure?: () => void;
}

/**
 * Razorpay checkout button for Project Ananda memberships.
 */
export function MembershipPayButton({
  membershipType,
  durationMonths,
  mode,
  userId,
  customerName,
  customerEmail,
  customerPhone,
  couponCode: externalCouponCode,
  onSuccess,
  onFailure,
}: MembershipPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponDetails | null>(null);

  const originalPrice = getMembershipPrice(membershipType, durationMonths, mode);
  const effectiveCouponCode = externalCouponCode || appliedCoupon?.couponCode;
  const finalAmount = appliedCoupon?.finalAmount ?? originalPrice;

  const handlePay = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const orderRes = await fetch("/api/membership/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipType,
          durationMonths,
          mode,
          userId,
          customerName,
          customerEmail,
          couponCode: effectiveCouponCode,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to initialize payment");
      }

      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!rzpKey) {
        throw new Error("Razorpay public key is missing");
      }

      const options = {
        key: rzpKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Tattvam Wellness Center",
        description: `Project Ananda — ${membershipType} — ${durationMonths} Month${durationMonths > 1 ? "s" : ""} (${mode === "online" ? "Online" : "Offline"})`,
        order_id: orderData.orderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone || "",
        },
        theme: { color: "#4f98a3" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onFailure?.();
          },
          escape: false,
          backdropclose: false,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/membership/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              onSuccess?.(verifyData.paymentId, response.razorpay_payment_id);
            } else {
              LOGGER.error("Membership payment verification failed", { response: verifyData });
              setShowFailed(true);
              onFailure?.();
            }
          } catch (err) {
            LOGGER.error("Error verifying membership payment", { error: String(err) });
            setShowFailed(true);
            onFailure?.();
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = createRazorpayInstance(options);

      rzp.on("payment.failed", () => {
        setShowFailed(true);
        setLoading(false);
        onFailure?.();
      });

      rzp.open();
    } catch (err) {
      LOGGER.error("Error initiating membership payment", { error: String(err) });
      const message = err instanceof Error ? err.message : "Could not start payment";
      alert(message);
      setLoading(false);
      onFailure?.();
    }
  };

  return (
    <>
      {!externalCouponCode && originalPrice > 0 && (
        <div className="mb-3">
          <CouponApplier
            originalAmount={originalPrice}
            itemType="membership"
            itemId={membershipType}
            membershipType={membershipType}
            onApply={setAppliedCoupon}
            onRemove={() => setAppliedCoupon(null)}
          />
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="btn-primary inline-flex w-full min-w-[8rem] items-center justify-center whitespace-nowrap px-4 py-3 text-center text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        aria-busy={loading}
      >
        {loading ? "Processing…" : `Pay Now (₹${finalAmount.toLocaleString("en-IN")})`}
      </button>
      {showFailed && (
        <PaymentFailedModal
          itemName={`Project Ananda — ${membershipType}`}
          onClose={() => setShowFailed(false)}
          onRetry={() => {
            setShowFailed(false);
            handlePay();
          }}
        />
      )}
    </>
  );
}
