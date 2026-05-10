"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAllWorkshops, type WorkshopRecord } from "@/lib/db/workshops";

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllWorkshops()
      .then(setWorkshops)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminShell title="Workshops Management" subtitle="Add, edit, and manage your workshops">
      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button className="btn-primary text-sm">➕ Add New Workshop</button>
          <button className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50">
            📤 Export CSV
          </button>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search workshops..."
            className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading workshops...</div>
        </div>
      ) : workshops.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-400">No workshops found in Firestore.</p>
          <a href="/admin/seed" className="btn-primary mt-4 inline-block text-sm">
            🌱 Seed Data First
          </a>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-50">
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Format</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workshops.map((workshop) => (
                <tr
                  key={workshop.id}
                  className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-tattvam-purple-800">{workshop.title}</p>
                    <p className="text-sm text-tattvam-purple-500">{workshop.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">{workshop.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        workshop.format === "Live Zoom"
                          ? "bg-green-100 text-green-700"
                          : "bg-tattvam-purple-100 text-tattvam-purple-600"
                      }`}
                    >
                      {workshop.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-tattvam-gold-600">
                    ₹{workshop.price}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200">
                        Edit
                      </button>
                      <button className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                        Archive
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
