import type { Metadata } from "next";
import { projectAnandaMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = projectAnandaMetadata;

export default function ProjectAnandaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
