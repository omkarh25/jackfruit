"use client";

import { computeMembershipStatus, type MembershipRecord } from "@/lib/db/memberships";
import { TIER_META } from "@/lib/membership-pricing";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function AnandaMembership({ membership }: { membership: MembershipRecord | null }) {
  if (!membership) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Ananda Membership</h2>
        <p className="mt-3 text-sm text-tattvam-purple-500">
          You don&apos;t have an active Project Ananda membership yet.
        </p>
        <a href="/services/project-ananda/pricing" className="btn-primary mt-4 inline-block text-sm">
          View Plans
        </a>
      </div>
    );
  }

  const { status, remainingDays } = computeMembershipStatus(membership);
  const badge =
    status === "Active"
      ? "bg-green-100 text-green-700"
      : status === "Expiring Soon"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Ananda Membership</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge}`}>{status}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs text-tattvam-purple-500">Tier</p>
          <p className="font-medium text-tattvam-purple-800">
            {TIER_META[membership.tier]?.name || membership.tier} ({membership.mode === "online" ? "Online" : "Offline"})
          </p>
        </div>
        <div>
          <p className="text-xs text-tattvam-purple-500">Duration</p>
          <p className="font-medium text-tattvam-purple-800">
            {membership.durationMonths} month{membership.durationMonths > 1 ? "s" : ""}
          </p>
        </div>
        <div>
          <p className="text-xs text-tattvam-purple-500">Start date</p>
          <p className="font-medium text-tattvam-purple-800">{formatDate(membership.startDate)}</p>
        </div>
        <div>
          <p className="text-xs text-tattvam-purple-500">Expiry date</p>
          <p className="font-medium text-tattvam-purple-800">{formatDate(membership.expiryDate)}</p>
        </div>
        <div>
          <p className="text-xs text-tattvam-purple-500">Remaining</p>
          <p className="font-medium text-tattvam-purple-800">
            {status === "Expired" ? "—" : `${remainingDays} day${remainingDays !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a href="/services/project-ananda/pricing" className="btn-primary text-sm">
          {status === "Expired" ? "Renew Membership" : "Renew / Extend"}
        </a>
        <a
          href="/services/project-ananda"
          className="rounded-full border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50"
        >
          Explore Project Ananda
        </a>
      </div>
    </div>
  );
}
