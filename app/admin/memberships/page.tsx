"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import {
  getMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  getAllMemberships,
  updateMembership,
  computeMembershipStatus,
  type MembershipPlan,
  type MembershipRecord,
} from "@/lib/db/memberships";
import { getAllUsers, type FirestoreUserProfile } from "@/lib/db/users";
import { getAllPayments, type PaymentRecord } from "@/lib/db/payments";
import {
  MEMBERSHIP_DURATIONS,
  OFFLINE_PRICES,
  ONLINE_PRICES,
  TIER_META,
  type MembershipTier,
} from "@/lib/membership-pricing";

const TIERS = Object.keys(TIER_META) as MembershipTier[];

type Tab = "plans" | "members" | "reports";

export default function AdminMembershipsPage() {
  const [tab, setTab] = useState<Tab>("members");
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [users, setUsers] = useState<Map<string, FirestoreUserProfile>>(new Map());
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [memberFilter, setMemberFilter] = useState<"all" | "active" | "expiring" | "expired">("all");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [planList, memberList, userList, paymentList] = await Promise.all([
        getMembershipPlans(),
        getAllMemberships(),
        getAllUsers(),
        getAllPayments(),
      ]);
      setPlans(planList);
      setMemberships(memberList);
      setUsers(new Map(userList.map((u) => [u.uid, u])));
      setPayments(paymentList);
    } catch (e) {
      console.error(e);
      showMessage("Failed to load membership data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  // ─── Plans tab ─────────────────────────────────────────────────────────────

  async function handleSeedDefaults() {
    if (!confirm("Create the default plan set (3 tiers × 4 durations) from the standard pricing?")) return;
    setSeeding(true);
    try {
      for (const tier of TIERS) {
        for (const months of MEMBERSHIP_DURATIONS) {
          const exists = plans.some((p) => p.tier === tier && p.durationMonths === months);
          if (exists) continue;
          await createMembershipPlan({
            tier,
            durationMonths: months,
            priceOnline: ONLINE_PRICES[tier][months],
            priceOffline: OFFLINE_PRICES[tier][months],
            active: true,
          });
        }
      }
      showMessage("Default plans created.", "success");
      await load();
    } catch (e) {
      console.error(e);
      showMessage("Failed to seed plans.", "error");
    } finally {
      setSeeding(false);
    }
  }

  async function handlePlanPriceChange(plan: MembershipPlan, field: "priceOnline" | "priceOffline", value: string) {
    const price = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (!plan.id || isNaN(price) || price <= 0) return;
    try {
      await updateMembershipPlan(plan.id, { [field]: price });
      setPlans(plans.map((p) => (p.id === plan.id ? { ...p, [field]: price } : p)));
    } catch (e) {
      console.error(e);
      showMessage("Failed to update plan price.", "error");
    }
  }

  async function handlePlanToggle(plan: MembershipPlan) {
    if (!plan.id) return;
    try {
      await updateMembershipPlan(plan.id, { active: !plan.active });
      setPlans(plans.map((p) => (p.id === plan.id ? { ...p, active: !p.active } : p)));
    } catch (e) {
      console.error(e);
      showMessage("Failed to update plan.", "error");
    }
  }

  // ─── Members tab ───────────────────────────────────────────────────────────

  async function handleExtend(m: MembershipRecord) {
    if (!m.id) return;
    const input = prompt("Extend expiry by how many months?", "1");
    if (!input) return;
    const months = parseInt(input, 10);
    if (isNaN(months) || months === 0) return;
    try {
      const expiry = new Date(m.expiryDate);
      expiry.setMonth(expiry.getMonth() + months);
      await updateMembership(m.id, { expiryDate: expiry.toISOString(), status: "active" });
      showMessage("Membership extended.", "success");
      await load();
    } catch (e) {
      console.error(e);
      showMessage("Failed to extend membership.", "error");
    }
  }

  async function handleTierChange(m: MembershipRecord, tier: MembershipTier) {
    if (!m.id) return;
    try {
      await updateMembership(m.id, { tier });
      showMessage("Tier updated.", "success");
      setMemberships(memberships.map((x) => (x.id === m.id ? { ...x, tier } : x)));
    } catch (e) {
      console.error(e);
      showMessage("Failed to update tier.", "error");
    }
  }

  // ─── Derived data ──────────────────────────────────────────────────────────

  const enrichedMembers = memberships.map((m) => ({
    ...m,
    computed: computeMembershipStatus(m),
    user: users.get(m.userId),
  }));

  const filteredMembers = enrichedMembers.filter((m) => {
    if (memberFilter === "all") return true;
    if (memberFilter === "active") return m.computed.status === "Active";
    if (memberFilter === "expiring") return m.computed.status === "Expiring Soon";
    return m.computed.status === "Expired";
  });

  const activeCount = enrichedMembers.filter((m) => m.computed.status === "Active").length;
  const expiringCount = enrichedMembers.filter((m) => m.computed.status === "Expiring Soon").length;
  const expiredCount = enrichedMembers.filter((m) => m.computed.status === "Expired").length;
  const renewalsCount = (() => {
    const byUser = new Map<string, number>();
    for (const m of memberships) byUser.set(m.userId, (byUser.get(m.userId) || 0) + 1);
    return Array.from(byUser.values()).filter((n) => n > 1).length;
  })();
  const membershipRevenue = payments
    .filter((p) => p.itemType === "membership" && p.status === "captured")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const tierDistribution = TIERS.map((tier) => ({
    tier,
    count: enrichedMembers.filter((m) => m.tier === tier && m.computed.status !== "Expired").length,
  }));

  const sortedPlans = [...plans].sort(
    (a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || a.durationMonths - b.durationMonths
  );

  return (
    <AdminShell title="Memberships" subtitle="Project Ananda plans, members, and reports">
      {message && (
        <div
          className={`mb-4 rounded-xl px-5 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex rounded-full border border-tattvam-purple-200 bg-white p-1">
        {(
          [
            { key: "members", label: `Members (${memberships.length})` },
            { key: "plans", label: `Plans (${plans.length})` },
            { key: "reports", label: "Reports" },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "bg-tattvam-purple-100 text-tattvam-purple-700"
                : "text-tattvam-purple-500 hover:text-tattvam-purple-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading memberships...</div>
        </div>
      ) : tab === "plans" ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-tattvam-purple-500">
              Edit prices inline (changes save on blur). Deactivated plans are hidden from new purchases.
            </p>
            <button onClick={handleSeedDefaults} disabled={seeding} className="btn-primary text-sm disabled:opacity-50">
              {seeding ? "Seeding..." : "⬇ Seed Default Plans"}
            </button>
          </div>
          {sortedPlans.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
              <p className="text-lg text-tattvam-purple-400">No plans yet. Seed the defaults to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-50">
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Tier</th>
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Duration</th>
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Online ₹</th>
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Offline ₹</th>
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-tattvam-purple-50 hover:bg-tattvam-purple-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-tattvam-purple-800">
                        {TIER_META[plan.tier]?.name || plan.tier}
                      </td>
                      <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                        {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          defaultValue={plan.priceOnline}
                          onBlur={(e) => handlePlanPriceChange(plan, "priceOnline", e.target.value)}
                          className="w-24 rounded-lg border border-tattvam-purple-200 px-2 py-1 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          defaultValue={plan.priceOffline}
                          onBlur={(e) => handlePlanPriceChange(plan, "priceOffline", e.target.value)}
                          className="w-24 rounded-lg border border-tattvam-purple-200 px-2 py-1 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handlePlanToggle(plan)}
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            plan.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {plan.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : tab === "members" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value as typeof memberFilter)}
              className="rounded-full border border-tattvam-purple-200 bg-white px-4 py-2.5 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
            >
              <option value="all">All ({memberships.length})</option>
              <option value="active">Active ({activeCount})</option>
              <option value="expiring">Expiring Soon ({expiringCount})</option>
              <option value="expired">Expired ({expiredCount})</option>
            </select>
          </div>
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
              <p className="text-lg text-tattvam-purple-400">No members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-50">
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Member</th>
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Tier</th>
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Mode</th>
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Expiry</th>
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="border-b border-tattvam-purple-50 hover:bg-tattvam-purple-50/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-tattvam-purple-800">{m.user?.name || "—"}</p>
                        <p className="text-xs text-tattvam-purple-500">{m.user?.email || m.userId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={m.tier}
                          onChange={(e) => handleTierChange(m, e.target.value as MembershipTier)}
                          className="rounded-lg border border-tattvam-purple-200 bg-white px-2 py-1 text-xs text-tattvam-purple-700 focus:border-tattvam-purple-400 focus:outline-none"
                        >
                          {TIERS.map((t) => (
                            <option key={t} value={t}>
                              {TIER_META[t]?.name || t}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-tattvam-purple-600 capitalize">{m.mode}</td>
                      <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                        {new Date(m.expiryDate).toLocaleDateString()}
                        <span className="ml-1 text-xs text-tattvam-purple-400">
                          ({m.computed.remainingDays}d)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            m.computed.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : m.computed.status === "Expiring Soon"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {m.computed.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleExtend(m)}
                          className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200"
                        >
                          Extend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Members" value={String(activeCount)} change="Currently subscribed" changeType="positive" icon="🌟" />
            <StatCard title="Expiring Soon" value={String(expiringCount)} change="Within 15 days" changeType="neutral" icon="⏰" />
            <StatCard title="Expired" value={String(expiredCount)} change="Lapsed memberships" changeType="negative" icon="📭" />
            <StatCard
              title="Membership Revenue"
              value={`₹${(membershipRevenue / 100).toLocaleString("en-IN")}`}
              change={`${renewalsCount} renewing member${renewalsCount !== 1 ? "s" : ""}`}
              changeType="positive"
              icon="💰"
            />
          </div>
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Distribution by Tier</h2>
            <div className="mt-4 space-y-3">
              {tierDistribution.map(({ tier, count }) => {
                const total = Math.max(activeCount + expiringCount, 1);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-tattvam-purple-800">{TIER_META[tier]?.name || tier}</span>
                      <span className="text-tattvam-purple-600">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-tattvam-purple-50">
                      <div className="h-2 rounded-full bg-tattvam-purple-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
