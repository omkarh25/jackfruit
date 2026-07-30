"use client";

import type { PaymentRecord } from "@/lib/db/payments";

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

export function PaymentHistory({ payments }: { payments: PaymentRecord[] }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Payment History</h2>

      {payments.length === 0 ? (
        <p className="py-6 text-center text-sm text-tattvam-purple-400">No payments yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-tattvam-purple-100">
                <th className="pb-3 text-xs font-semibold text-tattvam-purple-600">Date</th>
                <th className="pb-3 text-xs font-semibold text-tattvam-purple-600">Program</th>
                <th className="pb-3 text-xs font-semibold text-tattvam-purple-600">Amount</th>
                <th className="pb-3 text-xs font-semibold text-tattvam-purple-600">Method</th>
                <th className="pb-3 text-xs font-semibold text-tattvam-purple-600">Status</th>
                <th className="pb-3 text-xs font-semibold text-tattvam-purple-600">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-tattvam-purple-50">
                  <td className="py-3 pr-4 text-sm text-tattvam-purple-600">
                    {p.createdAt?.toDate
                      ? p.createdAt.toDate().toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="py-3 pr-4 text-sm font-medium text-tattvam-purple-800">
                    {p.itemTitle || p.itemType}
                  </td>
                  <td className="py-3 pr-4 text-sm text-tattvam-purple-800">
                    ₹{(p.amount / 100).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 pr-4 text-sm text-tattvam-purple-600">Razorpay</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-tattvam-purple-500">
                    {p.razorpayPaymentId || p.orderId || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
