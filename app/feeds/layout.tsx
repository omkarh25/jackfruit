import type { Metadata } from "next";
import { feedsMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = feedsMetadata;

export default function FeedsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
