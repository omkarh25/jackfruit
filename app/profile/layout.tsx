import type { Metadata } from "next";
import { profileMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = profileMetadata;

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
