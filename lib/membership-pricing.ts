/**
 * Shared Project Ananda membership pricing and feature matrix.
 * Pure data module — safe to import from both client components and API routes.
 */

export type MembershipTier = "RISE" | "INNER CIRCLE";
export type MembershipMode = "online" | "offline";

export const MEMBERSHIP_DURATIONS = [1, 3, 6, 12] as const;

export const OFFLINE_PRICES: Record<MembershipTier, Record<number, number>> = {
  RISE: { 1: 4500, 3: 12500, 6: 24000, 12: 44000 },
  "INNER CIRCLE": { 1: 9000, 3: 25000, 6: 48000, 12: 88000 },
};

export const ONLINE_PRICES: Record<MembershipTier, Record<number, number>> = {
  RISE: { 1: 3600, 3: 10000, 6: 19200, 12: 35200 },
  "INNER CIRCLE": { 1: 7200, 3: 20000, 6: 38400, 12: 70000 },
};

export function getMembershipPrice(
  tier: MembershipTier,
  months: number,
  mode: MembershipMode = "offline"
): number {
  const map = mode === "online" ? ONLINE_PRICES : OFFLINE_PRICES;
  return map[tier]?.[months] ?? 0;
}

export const TIER_META: Record<
  MembershipTier,
  { name: string; tagline: string; recommended?: boolean }
> = {
  RISE: {
    name: "Ananda Rise",
    tagline: "Accelerate Your Transformation",
    recommended: true,
  },
  "INNER CIRCLE": { name: "Ananda Inner Circle", tagline: "Complete Immersion Experience" },
};

/** Cell value: true = included, false = not included, string = custom label. */
export type FeatureCell = boolean | string;

export interface FeatureRow {
  feature: string;
  rise: FeatureCell;
  innerCircle: FeatureCell;
}

export const FEATURE_MATRIX: FeatureRow[] = [
  { feature: "Medical Diagnosis Report", rise: true, innerCircle: true },
  { feature: "Yoga Sessions", rise: true, innerCircle: true },
  { feature: "Kalari Payattu", rise: true, innerCircle: true },
  { feature: "Guidance Based on Diagnosis", rise: true, innerCircle: true },
  { feature: "Routine & Diet Fixing", rise: true, innerCircle: true },
  { feature: "Sound Healing Sessions", rise: true, innerCircle: true },
  { feature: "Weekly Healing Sessions", rise: true, innerCircle: true },
  {
    feature: "Community Gatherings",
    rise: "Discounted",
    innerCircle: "Free Access",
  },
  { feature: "Exclusive 1-on-1 Sessions", rise: false, innerCircle: true },
  { feature: "Priority Support", rise: false, innerCircle: true },
  { feature: "Complete Immersion", rise: false, innerCircle: true },
  { feature: "Full Transformation Path", rise: false, innerCircle: true },
];
