import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminNotificationsPage() {
  return (
    <AdminShell
      title="Notifications"
      subtitle="Manage email and SMS campaigns"
    >
      <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
        <p className="text-4xl mb-4">🔔</p>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">Notifications System</h2>
        <p className="mt-4 text-tattvam-purple-600/70 max-w-xl mx-auto">
          Set up email/SMS triggers for booking confirmations, payment success, session reminders. 
          Receive admin alerts for new bookings and cancellations.
        </p>
        <button className="btn-primary mt-6 text-sm">Coming Soon</button>
      </div>
    </AdminShell>
  );
}
