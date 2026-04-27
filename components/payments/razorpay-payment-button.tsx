"use client";

import { useEffect, useRef } from "react";
import { LOGGER } from "@/lib/logger";

interface RazorpayPaymentButtonProps {
  readonly paymentButtonId: string;
}

/**
 * Renders Razorpay's hosted payment button script in a React-safe way.
 */
export function RazorpayPaymentButton({ paymentButtonId }: RazorpayPaymentButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!formRef.current || formRef.current.dataset.loaded === "true") {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.dataset.payment_button_id = paymentButtonId;
    script.onload = () => LOGGER.info("Razorpay payment button loaded", { paymentButtonId });
    script.onerror = () => LOGGER.error("Failed to load Razorpay payment button", { paymentButtonId });

    formRef.current.dataset.loaded = "true";
    formRef.current.appendChild(script);
  }, [paymentButtonId]);

  return <form ref={formRef} aria-label="Razorpay payment form" />;
}