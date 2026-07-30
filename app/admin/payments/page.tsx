"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { useAuth } from "@/components/auth/auth-provider";
import type { AdminPaymentRow, AdminPaymentsResponse } from "@/app/api/admin/payments/route";

const STATUS_OPTIONS = ["All", "captured", "created", "failed", "refunded"];
const TYPE_OPTIONS = ["All", "consultation", "workshop", "service", "course", "membership"];

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function statusBadge(status: string) {
  switch (status) {
    case "captured":
      return "bg-green-100 text-green-700";
    case "created":
      return "bg-amber-100 text-amber-700";
    case "refunded":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

export default function AdminPaymentsPage() {
  const { firebaseUser } = useAuth();
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [summary, setSummary] = useState<AdminPaymentsResponse["summary"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (typeFilter !== "All") params.set("itemType", typeFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await fetch(`/api/admin/payments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: AdminPaymentsResponse = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load payments");
      setPayments(data.payments || []);
      setSummary(data.summary || null);
    } catch (e) {
      console.error(e);
      setMessage({ text: "Failed to load payments. Please refresh.", type: "error" });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser, statusFilter, typeFilter, fromDate, toDate]);

  useEffect(() => {
    if (firebaseUser) loadPayments();
  }, [firebaseUser, loadPayments]);

  function exportToCSV() {
    const headers = ["date", "user", "email", "item_type", "item", "amount_inr", "status", "razorpay_payment_id", "order_id", "coupon"];
    const rows = payments.map((p) => [
      p.createdAt ? new Date(p.createdAt).toLocaleString("en-IN") : "",
      p.userName,
      p.userEmail,
      p.itemType,
      p.itemTitle,
      (p.amount / 100).toFixed(2),
      p.status,
      p.razorpayPaymentId || "",
      p.orderId,
      p.couponCode || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell title="Payments & Revenue" subtitle="Track all transactions and financial metrics">
      {message && (
        <div
          className={`mb-4 rounded-xl px-5 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Revenue stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatRupees(summary?.totalCaptured || 0)}
          change="Captured payments"
          changeType="positive"
          icon="💰"
        />
        <StatCard
          title="Captured"
          value={String(summary?.countsByStatus?.captured || 0)}
          change="Successful payments"
          changeType="positive"
          icon="✅"
        />
        <StatCard
          title="Pending"
          value={String(summary?.countsByStatus?.created || 0)}
          change="Created, not paid"
          changeType="neutral"
          icon="⏳"
        />
        <StatCard
          title="Failed / Refunded"
          value={String((summary?.countsByStatus?.failed || 0) + (summary?.countsByStatus?.refunded || 0))}
          change="Needs attention"
          changeType="negative"
          icon="⚠️"
        />
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-full border border-tattvam-purple-200 bg-white px-4 py-2.5 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-full border border-tattvam-purple-200 bg-white px-4 py-2.5 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "All Types" : t}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded-full border border-tattvam-purple-200 bg-white px-4 py-2.5 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded-full border border-tattvam-purple-200 bg-white px-4 py-2.5 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
        />
        <button
          onClick={exportToCSV}
          disabled={payments.length === 0}
          className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50 disabled:opacity-50"
        >
          📤 Export CSV
        </button>
        <span className="text-sm text-tattvam-purple-500">
          {payments.length} payment{payments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Payments table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading payments...</div>
        </div>
      ) : payments.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-400">No payments found for these filters.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-50">
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Item</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Razorpay ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50">
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                    {p.createdAt ? new Date(p.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-tattvam-purple-800">{p.userName || "—"}</p>
                    <p className="text-xs text-tattvam-purple-500">{p.userEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-tattvam-purple-800">{p.itemTitle || p.itemId}</p>
                    <p className="text-xs text-tattvam-purple-500">{p.itemType}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-tattvam-purple-800">
                    {formatRupees(p.amount)}
                    {p.discountAmount ? (
                      <span className="ml-1 text-xs text-green-600">(−₹{p.discountAmount})</span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-tattvam-purple-500">
                    {p.razorpayPaymentId || p.orderId || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
