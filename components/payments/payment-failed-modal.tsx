"use client";

interface PaymentFailedModalProps {
  itemName: string;
  errorMessage?: string;
  onClose?: () => void;
  onRetry?: () => void;
}

export function PaymentFailedModal({
  itemName,
  errorMessage = "We couldn't process your payment. Please try again or contact support.",
  onClose,
  onRetry,
}: PaymentFailedModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl text-red-600">✕</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
          Payment Failed
        </h2>
        <p className="mt-3 text-tattvam-purple-700">
          We were unable to process your payment for{" "}
          <span className="font-semibold">{itemName}</span>.
        </p>
        <p className="mt-2 text-sm text-tattvam-purple-500">{errorMessage}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onRetry && (
            <button onClick={onRetry} className="btn-primary inline-flex justify-center">
              Retry Payment
            </button>
          )}
          <button onClick={onClose} className="btn-secondary inline-flex justify-center">
            {onRetry ? "Close" : "Go to Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
