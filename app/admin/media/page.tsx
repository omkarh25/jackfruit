import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminMediaPage() {
  return (
    <AdminShell
      title="Media Library"
      subtitle="Central asset management for images and videos"
    >
      <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
        <p className="text-4xl mb-4">🖼️</p>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">Media Library</h2>
        <p className="mt-4 text-tattvam-purple-600/70 max-w-xl mx-auto">
          Upload images and videos. Reuse assets across services, workshops, and pages. 
          Organize by folders for easy access.
        </p>
        <button className="btn-primary mt-6 text-sm">Coming Soon</button>
      </div>
    </AdminShell>
  );
}
