import { AdminShell } from "@/components/admin/admin-shell";
import { services } from "@/lib/data";

export default function AdminServicesPage() {
  return (
    <AdminShell
      title="Services Management"
      subtitle="Manage your wellness services and offerings"
    >
      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button className="btn-primary text-sm">
            ➕ Add New Service
          </button>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search services..."
            className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-50">
              <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Title</th>
              <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Duration</th>
              <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Price</th>
              <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Visibility</th>
              <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service.id}
                className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-tattvam-purple-800">{service.title}</p>
                  <p className="text-sm text-tattvam-purple-500">{service.description}</p>
                </td>
                <td className="px-6 py-4 text-sm text-tattvam-purple-600">{service.duration}</td>
                <td className="px-6 py-4 text-sm font-medium text-tattvam-gold-600">{service.price}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-tattvam-purple-100 px-3 py-1 text-xs font-bold text-tattvam-purple-600">
                    Healing
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Published
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200">
                      Edit
                    </button>
                    <button className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                      Unpublish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
