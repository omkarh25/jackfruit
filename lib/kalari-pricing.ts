export type KalariMode = "online" | "offline";

export const KALARI_DURATIONS = [1, 3, 6, 12] as const;

export const KALARI_ONLINE_PRICES: Record<number, number> = {
  1: 2880,
  3: 8000,
  6: 15360,
  12: 28160,
};

export const KALARI_OFFLINE_PRICES: Record<number, number> = {
  1: 3600,
  3: 10000,
  6: 19200,
  12: 35200,
};

export function getKalariPrice(months: number, mode: KalariMode = "offline"): number {
  const map = mode === "online" ? KALARI_ONLINE_PRICES : KALARI_OFFLINE_PRICES;
  return map[months] ?? 0;
}

export function getKalariPerDayPrice(months: number, mode: KalariMode = "offline"): number {
  const total = getKalariPrice(months, mode);
  return total > 0 ? Math.round(total / (months * 30)) : 0;
}

export interface KalariFeatureRow {
  feature: string;
  online: boolean | string;
  offline: boolean | string;
}

export const KALARI_FEATURE_MATRIX: KalariFeatureRow[] = [
  { feature: "Traditional Kalari movements", online: true, offline: true },
  { feature: "Strength & flexibility training", online: true, offline: true },
  { feature: "Mobility & conditioning", online: true, offline: true },
  { feature: "Self-defense techniques", online: true, offline: true },
  { feature: "Live online classes", online: true, offline: false },
  { feature: "Live instructor-led training", online: false, offline: true },
  { feature: "Progress guidance", online: true, offline: false },
  { feature: "Personal correction & guidance", online: false, offline: true },
];

export const KALARI_PLANS = {
  online: {
    title: "Kalari Online",
    subtitle: "Train Anywhere",
    header: "Learn & Practice",
    description: "Train from anywhere with guided sessions",
    features: [
      "Live online classes",
      "Traditional Kalari movements",
      "Strength & flexibility training",
      "Mobility & conditioning",
      "Self-defense techniques",
      "Progress guidance",
    ],
    focus: "Strength, flexibility, discipline & focus",
  },
  offline: {
    title: "Kalari Offline",
    subtitle: "Train in the Kalari",
    header: "Learn, Practice & Experience",
    description: "Experience traditional Kalari training in person",
    features: [
      "Live instructor-led training",
      "Traditional Kalari movements",
      "Strength & flexibility training",
      "Mobility & conditioning",
      "Self-defense techniques",
      "Personal correction & guidance",
    ],
    focus: "Strength, agility, confidence & self-defense",
  },
} as const;
