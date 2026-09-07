import type { Metadata } from "next";
import { bookingMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = bookingMetadata;

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
