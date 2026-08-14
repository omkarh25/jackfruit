export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
  handler?: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", callback: (response?: unknown) => void) => void;
}

/**
 * Helper to safely instantiate Razorpay checkout instance in client-side components.
 */
export function createRazorpayInstance(options: RazorpayCheckoutOptions): RazorpayInstance {
  const RazorpayClass = (
    window as unknown as {
      Razorpay: new (opts: RazorpayCheckoutOptions) => RazorpayInstance;
    }
  ).Razorpay;

  if (!RazorpayClass) {
    throw new Error("Razorpay SDK is not loaded. Please try again.");
  }

  return new RazorpayClass(options);
}
