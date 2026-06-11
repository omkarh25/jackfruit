"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PaymentSuccessModalProps {
  itemName: string;
  itemType: string;
  redirectUrl?: string;
  onClose?: () => void;
}

export function PaymentSuccessModal({
  itemName,
  itemType,
  redirectUrl,
  onClose,
}: PaymentSuccessModalProps) {
  const [countdown, setCountdown] = useState(redirectUrl ? 5 : 0);

  useEffect(() => {
    if (!redirectUrl || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, redirectUrl]);

  useEffect(() => {
    if (redirectUrl && countdown === 0) {
      window.location.href = redirectUrl;
    }
  }, [countdown, redirectUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <span className="text-2xl text-green-600">✓</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
          Thank You!
        </h2>
        <p className="mt-3 text-tattvam-purple-700">
          Thank you for registering for the {itemType.toLowerCase()}{" "}
          <span className="font-semibold">{itemName}</span>.
        </p>
        {redirectUrl ? (
          <>
            <p className="mt-2 text-sm text-tattvam-purple-500">
              You will be redirected to the WhatsApp group in{" "}
              <span className="font-bold text-tattvam-purple-700">{countdown}</span>{" "}
              seconds.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex justify-center"
              >
                Join WhatsApp Group Now
              </a>
              <button
                onClick={onClose}
                className="btn-secondary inline-flex justify-center"
              >
                Go to Profile
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={onClose}
              className="btn-primary inline-flex justify-center"
            >
              Go to My Profile
            </button>
            <Link href="/" className="btn-secondary inline-flex justify-center">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
