import { NextResponse } from "next/server";
import { validateCoupon, type ValidateCouponContext } from "@/lib/coupon-validation";

export interface ValidateCouponRequestBody {
  code: string;
  itemType: ValidateCouponContext["itemType"];
  itemId: string;
  originalAmount: number;
  membershipType?: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  couponCode?: string;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  discountAmount?: number;
  finalAmount?: number;
  error?: string;
}

export async function POST(req: Request) {
  try {
    const body: ValidateCouponRequestBody = await req.json();
    const { code, itemType, itemId, originalAmount, membershipType } = body;

    if (!code || !itemType || !itemId || originalAmount == null) {
      return NextResponse.json<ValidateCouponResponse>(
        { valid: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await validateCoupon({
      code,
      itemType,
      itemId,
      originalAmount,
      membershipType,
    });

    return NextResponse.json<ValidateCouponResponse>(result);
  } catch (err) {
    console.error("[coupons/validate] error:", err);
    const message = err instanceof Error ? err.message : "Coupon validation failed";
    return NextResponse.json<ValidateCouponResponse>(
      { valid: false, error: message },
      { status: 500 }
    );
  }
}
