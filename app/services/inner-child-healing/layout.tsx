import type { Metadata } from "next";
import { innerChildMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = innerChildMetadata;

export default function InnerChildHealingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
