import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Server-side Razorpay payment service.
 *
 * This module is intentionally isolated so it can be reused across API routes
 * (1:1 consultations, courses, workshops, etc.) without coupling to UI code.
 */

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

function getRazorpayClient(): Razorpay {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local");
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

export interface CreateOrderInput {
  /** Amount in Indian Rupees (e.g. 500 for ₹500). Will be converted to paise. */
  amountInRupees: number;
  /** Unique receipt / booking id. Max 40 chars. */
  receipt: string;
  /** Optional metadata echoed back in webhooks. Values must be strings. */
  notes?: Record<string, string>;
}

export interface CreateOrderOutput {
  orderId: string;
  amount: number; // in paise
  currency: string;
  receipt: string;
}

/**
 * Creates a Razorpay Order with the given dynamic amount.
 * The price is always computed server-side and never trusted from the client.
 */
export async function createRazorpayOrder(input: CreateOrderInput): Promise<CreateOrderOutput> {
  const client = getRazorpayClient();
  const amountInPaise = Math.round(input.amountInRupees * 100);

  if (amountInPaise < 100) {
    throw new Error(`Invalid amount: ₹${input.amountInRupees} is below the minimum allowed.`);
  }

  const order = await client.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: input.receipt,
    notes: input.notes,
  });

  return {
    orderId: order.id,
    amount: order.amount as number,
    currency: order.currency,
    receipt: order.receipt ?? input.receipt,
  };
}

export interface VerifySignatureInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * Verifies the Razorpay payment signature using HMAC-SHA256.
 */
export function verifyRazorpaySignature(input: VerifySignatureInput): boolean {
  if (!RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay key secret is not configured.");
  }

  const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body).digest("hex");
  return expected === input.razorpaySignature;
}

/** Converts an amount in rupees to paise (smallest currency unit). */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Converts an amount in paise back to rupees. */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}
