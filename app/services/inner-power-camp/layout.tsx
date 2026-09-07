import type { Metadata } from "next";
import { innerPowerCampMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = innerPowerCampMetadata;

export default function InnerPowerCampLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
