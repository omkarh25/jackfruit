import type { Metadata } from "next";
import { coursesMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = coursesMetadata;

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
