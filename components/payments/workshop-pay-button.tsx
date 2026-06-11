"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { LOGGER } from "@/lib/logger";
import { PaymentSuccessModal } from "./payment-success-modal";

export interface WorkshopPayButtonProps {
  workshopId: string;
  workshopTitle: string;
  price: number;
  redirectUrl?: string;
  className?: string;
  buttonText?: string;
}

/**
 * Standard Razorpay checkout button for workshops.
 * Checks for login status first; if not logged in, prompts Google Login.
 * On payment success, verifies signature server-side and redirects to redirectUrl.
 */
export function WorkshopPayButton({
  workshopId,
  workshopTitle,
  price,
  redirectUrl,
  className = "btn-primary w-full text-center inline-flex justify-center items-center py-3.5 px-8 text-base font-semibold shadow-soft hover:shadow-medium transition",
  buttonText = "Reserve My Spot",
}: WorkshopPayButtonProps) {
  const { firebaseUser, profile, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePay = async () => {
    // 1. If not logged in, prompt sign in.
    if (!firebaseUser || !profile) {
      try {
        await loginWithGoogle();
      } catch (err) {
        LOGGER.error("Google login failed during checkout", { error: String(err) });
        alert("Please sign in to proceed with payment.");
      }
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      // 2. Create Order via api
      const orderRes = await fetch("/api/payment/create-workshop-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          userId: firebaseUser.uid,
          customerName: profile.name || firebaseUser.displayName || "",
          customerEmail: profile.email || firebaseUser.email || "",
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to initialize payment");
      }

      // 3. Open Razorpay modal
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!rzpKey) {
        throw new Error("Razorpay public key is missing");
      }

      const options = {
        key: rzpKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Tattvam Wellness Center",
        description: workshopTitle,
        order_id: orderData.orderId,
        prefill: {
          name: profile.name || firebaseUser.displayName || "",
          email: profile.email || firebaseUser.email || "",
        },
        theme: { color: "#5b3e8c" }, // Brand purple color
        modal: {
          ondismiss: () => {
            setLoading(false);
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
            // 4. Verify signature server-side
            const verifyRes = await fetch("/api/payment/verify-workshop", {
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
              LOGGER.info("Workshop payment successful", { workshopId, redirectUrl });
              setShowSuccess(true);
            } else {
              LOGGER.error("Workshop verification failed", { response: verifyData });
              alert(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch (err) {
            LOGGER.error("Error verifying workshop payment", { error: String(err) });
            alert("Could not verify payment. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void; on: (event: string, cb: () => void) => void } }).Razorpay(options);

      rzp.on("payment.failed", () => {
        alert("Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      LOGGER.error("Error initiating payment", { error: String(err) });
      const message = err instanceof Error ? err.message : "Could not start payment";
      alert(message);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePay}
        disabled={loading}
        className={className}
        aria-busy={loading}
      >
        {!firebaseUser
          ? "Sign In to Register"
          : loading
          ? "Processing…"
          : `${buttonText} (₹${price})`}
      </button>

      {showSuccess && (
        <PaymentSuccessModal
          itemName={workshopTitle}
          itemType="workshop"
          redirectUrl={redirectUrl}
          onClose={() => {
            setShowSuccess(false);
            window.location.href = "/profile";
          }}
        />
      )}
    </>
  );
}
