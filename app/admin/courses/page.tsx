import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminCoursesPage() {
  return (
    <AdminShell
      title="Courses Management"
      subtitle="Create and manage your digital programs"
    >
      <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
        <p className="text-4xl mb-4">📚</p>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">Courses Management</h2>
        <p className="mt-4 text-tattvam-purple-600/70 max-w-xl mx-auto">
          This module will allow you to create courses, add modules & lessons, upload videos/PDFs/audio, 
          set pricing, track enrollments, and manage drip content.
        </p>
        <button className="btn-primary mt-6 text-sm">Coming Soon</button>
      </div>
    </AdminShell>
  );
}
