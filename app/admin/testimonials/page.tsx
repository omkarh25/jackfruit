import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminTestimonialsPage() {
  return (
    <AdminShell
      title="Testimonials & Reviews"
      subtitle="Manage social proof and client stories"
    >
      <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
        <p className="text-4xl mb-4">💬</p>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">Testimonials & Reviews</h2>
        <p className="mt-4 text-tattvam-purple-600/70 max-w-xl mx-auto">
          Add, edit, delete testimonials. Approve user-submitted reviews. 
          Highlight featured testimonials on the homepage.
        </p>
        <button className="btn-primary mt-6 text-sm">Coming Soon</button>
      </div>
    </AdminShell>
  );
}
