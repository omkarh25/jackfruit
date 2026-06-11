"use client";

import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminSidebar />
      {children}
    </AdminAuthGuard>
  );
}
