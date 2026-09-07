import type { Metadata } from "next";
import { kalariPayattuMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = kalariPayattuMetadata;

export default function KalariPayattuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
