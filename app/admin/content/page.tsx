import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminContentPage() {
  return (
    <AdminShell
      title="Content Management"
      subtitle="Edit homepage sections, banners, FAQs and more"
    >
      <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
        <p className="text-4xl mb-4">📝</p>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">Content Management (CMS Lite)</h2>
        <p className="mt-4 text-tattvam-purple-600/70 max-w-xl mx-auto">
          Edit homepage sections, service descriptions, workshop banners, testimonials, 
          and FAQs without needing a developer.
        </p>
        <button className="btn-primary mt-6 text-sm">Coming Soon</button>
      </div>
    </AdminShell>
  );
}
