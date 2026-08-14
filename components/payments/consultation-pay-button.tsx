"use client";

import { useState } from "react";
import { createRazorpayInstance } from "@/lib/razorpay-client";
import { LOGGER } from "@/lib/logger";
import { PaymentFailedModal } from "./payment-failed-modal";
import { CouponApplier, type AppliedCouponDetails } from "./coupon-applier";

export interface ConsultationPayButtonProps {
  slotId: string;
  bookingId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceTitle?: string;
  price?: number;
  couponCode?: string;
  onSuccess?: (paymentId: string, razorpayPaymentId: string) => void;
  onFailure?: () => void;
}

/**
 * Dynamic Razorpay checkout button for 1:1 consultations.
 *
 * Flow:
 * 1. Fetches a fresh Razorpay Order from /api/payment/create-order using the
 *    slot price stored in Firestore.
 * 2. Opens the Razorpay checkout modal with the customer's details prefilled.
 * 3. On success, verifies the payment signature server-side via
 *    /api/payment/verify and invokes onSuccess.
 * 4. On failure or modal dismiss, invokes onFailure so the parent can release
 *    the held slot.
 */
export function ConsultationPayButton({
  slotId,
  bookingId,
  userId,
  customerName,
  customerEmail,
  customerPhone,
  serviceTitle = "1:1 Consultation",
  price,
  couponCode: externalCouponCode,
  onSuccess,
  onFailure,
}: ConsultationPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponDetails | null>(null);

  const effectiveCouponCode = externalCouponCode || appliedCoupon?.couponCode;

  const handlePay = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Create order server-side using the slot's dynamic price.
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          bookingId,
          userId,
          serviceTitle,
          couponCode: effectiveCouponCode,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to initialize payment");
      }

      // 2. Open Razorpay checkout modal.
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!rzpKey) {
        throw new Error("Razorpay public key is missing");
      }

      const options = {
        key: rzpKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Tattvam Wellness Center",
        description: serviceTitle,
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
            // 3. Verify payment server-side.
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              onSuccess?.(verifyData.paymentId, response.razorpay_payment_id);
            } else {
              LOGGER.error("Payment verification failed", { response: verifyData });
              setShowFailed(true);
              onFailure?.();
            }
          } catch (err) {
            LOGGER.error("Error verifying payment", { error: String(err) });
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
      LOGGER.error("Error initiating payment", { error: String(err) });
      const message = err instanceof Error ? err.message : "Could not start payment";
      alert(message);
      setLoading(false);
      onFailure?.();
    }
  };

  const finalAmount = appliedCoupon?.finalAmount ?? price;

  return (
    <>
      {!externalCouponCode && price != null && price > 0 && (
        <div className="mb-4">
          <CouponApplier
            originalAmount={price}
            itemType="consultation"
            itemId={serviceTitle}
            onApply={setAppliedCoupon}
            onRemove={() => setAppliedCoupon(null)}
          />
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="btn-primary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        aria-busy={loading}
      >
        {loading ? "Processing…" : finalAmount != null ? `Pay Now (₹${finalAmount})` : "Pay Now"}
      </button>
      {showFailed && (
        <PaymentFailedModal
          itemName={serviceTitle}
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
