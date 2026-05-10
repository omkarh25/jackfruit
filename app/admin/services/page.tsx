"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAllServices, type ServiceRecord } from "@/lib/db/services";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminShell title="Services Management" subtitle="Manage your wellness services and offerings">
      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button className="btn-primary text-sm">➕ Add New Service</button>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search services..."
            className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading services...</div>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-400">No services found in Firestore.</p>
          <p className="mt-2 text-sm text-tattvam-purple-400">Add services using the button above.</p>
        </div>
      ) : (
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
                  <td className="px-6 py-4 text-sm font-medium text-tattvam-gold-600">
                    {service.price}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-tattvam-purple-100 px-3 py-1 text-xs font-bold text-tattvam-purple-600">
                      {service.category || "Healing"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        service.isVisible
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {service.isVisible ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200">
                        Edit
                      </button>
                      <button className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                        {service.isVisible ? "Hide" : "Show"}
                      </button>
                    </div>
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
