import type { Metadata } from "next";
import { tarotMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = tarotMetadata;

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
