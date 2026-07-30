"use client";

import type { MembershipRecord } from "@/lib/db/memberships";
import { computeMembershipStatus } from "@/lib/db/memberships";
import type { ProgramItem } from "./my-programs";

interface DashboardSummaryProps {
  membership: MembershipRecord | null;
  programs: ProgramItem[];
  attendance: { present: number; total: number; percentage: number } | null;
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <p className="text-xs font-medium text-tattvam-purple-500">{label}</p>
      <p className="mt-1 font-serif text-2xl font-bold text-tattvam-purple-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-tattvam-purple-500">{sub}</p>}
    </div>
  );
}

export function DashboardSummary({ membership, programs, attendance }: DashboardSummaryProps) {
  const upcoming = programs
    .filter((p) => p.status === "Upcoming" && p.date && !isNaN(new Date(p.date).getTime()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextSession = upcoming[0] || null;
  const membershipStatus = membership ? computeMembershipStatus(membership).status : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SummaryCard
        label="Membership"
        value={membership ? membership.tier : "None"}
        sub={membership ? `${membershipStatus} · expires ${new Date(membership.expiryDate).toLocaleDateString()}` : "Join Project Ananda"}
      />
      <SummaryCard
        label="Programs Enrolled"
        value={String(programs.length)}
        sub={`${programs.filter((p) => p.status === "Upcoming" || p.status === "In Progress").length} active`}
      />
      <SummaryCard
        label="Next Session"
        value={nextSession ? nextSession.title : "—"}
        sub={
          nextSession
            ? new Date(nextSession.date).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "Nothing scheduled"
        }
      />
      <SummaryCard
        label="Classes Attended"
        value={attendance ? String(attendance.present) : "—"}
        sub={attendance ? `of ${attendance.total} marked sessions` : "No attendance records yet"}
      />
      <SummaryCard
        label="Attendance"
        value={attendance && attendance.total > 0 ? `${attendance.percentage}%` : "—"}
        sub={attendance && attendance.total > 0 ? "Keep it up!" : "Will appear after your first session"}
      />
    </div>
  );
}
