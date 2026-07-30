"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

const ADMIN_ONLY_PATHS = [
  "/admin",
  "/admin/services",
  "/admin/courses",
  "/admin/payments",
  "/admin/users",
  "/admin/content",
  "/admin/testimonials",
  "/admin/notifications",
  "/admin/offers",
  "/admin/media",
];

const COACH_ALLOWED_PATHS = ["/admin/consultations"];

function isPathAllowed(pathname: string, role?: string): boolean {
  if (role === "admin" || role === "super_admin") return true;
  if (role === "coach") {
    return COACH_ALLOWED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }
  return false;
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!firebaseUser) {
      router.replace("/");
      return;
    }

    const role = profile?.role;
    if (!isPathAllowed(pathname, role)) {
      if (role === "learner") {
        router.replace("/profile");
      } else if (role === "coach") {
        router.replace("/admin/consultations");
      } else {
        router.replace("/");
      }
      return;
    }

    setChecked(true);
  }, [firebaseUser, profile, isLoading, pathname, router]);

  if (isLoading || !checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-tattvam-purple-900">
        <div className="text-tattvam-purple-400">Checking authorization...</div>
      </div>
    );
  }

  return <>{children}</>;
}
