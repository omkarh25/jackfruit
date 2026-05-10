import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminUsersPage() {
  return (
    <AdminShell
      title="User Management"
      subtitle="Manage all your clients and their activity"
    >
      <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
        <p className="text-4xl mb-4">👥</p>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">User Management</h2>
        <p className="mt-4 text-tattvam-purple-600/70 max-w-xl mx-auto">
          View all users, filter by activity status, course enrolled, service taken. 
          Edit details, view booking/purchase history, and tag users.
        </p>
        <button className="btn-primary mt-6 text-sm">Coming Soon</button>
      </div>
    </AdminShell>
  );
}
