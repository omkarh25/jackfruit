import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminPaymentsPage() {
  return (
    <AdminShell
      title="Payments & Revenue"
      subtitle="Track all transactions and financial metrics"
    >
      <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
        <p className="text-4xl mb-4">💰</p>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">Payments & Revenue Tracking</h2>
        <p className="mt-4 text-tattvam-purple-600/70 max-w-xl mx-auto">
          View all transactions, filter by service/workshop/course, track total revenue, 
          pending payments, failed/refunded statuses, and download monthly reports.
        </p>
        <button className="btn-primary mt-6 text-sm">Coming Soon</button>
      </div>
    </AdminShell>
  );
}
