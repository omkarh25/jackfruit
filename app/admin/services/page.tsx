"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
  type ServiceRecord,
} from "@/lib/db/services";

const emptyService: Omit<ServiceRecord, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  slug: "",
  description: "",
  duration: "",
  price: "",
  date: "",
  enquiryMode: false,
  category: "Healing",
  outcomes: [],
  isVisible: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [form, setForm] = useState(emptyService);
  const [datesInput, setDatesInput] = useState("");
  const [outcomesInput, setOutcomesInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setIsLoading(true);
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  function openAdd() {
    setEditingService(null);
    setForm(emptyService);
    setDatesInput("");
    setOutcomesInput("");
    setIsModalOpen(true);
  }

  function openEdit(service: ServiceRecord) {
    setEditingService(service);
    setForm({
      title: service.title,
      slug: service.slug,
      description: service.description,
      duration: service.duration,
      price: service.price,
      date: service.date || "",
      enquiryMode: service.enquiryMode || false,
      category: service.category || "Healing",
      outcomes: service.outcomes || [],
      isVisible: service.isVisible,
    });
    setDatesInput(service.dates?.join(", ") || "");
    setOutcomesInput(service.outcomes?.join(", ") || "");
    setIsModalOpen(true);
  }

  async function handleSave() {
    const data = {
      ...form,
      dates: datesInput
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      outcomes: outcomesInput
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    };
    try {
      if (editingService?.id) {
        await updateService(editingService.id, data);
      } else {
        await createService(data);
      }
      setIsModalOpen(false);
      await loadServices();
    } catch (e) {
      console.error(e);
      alert("Failed to save service. Please try again.");
    }
  }

  async function handleToggleVisibility(service: ServiceRecord) {
    try {
      await updateService(service.id!, { isVisible: !service.isVisible });
      await loadServices();
    } catch (e) {
      console.error(e);
      alert("Failed to update visibility.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(id);
      await loadServices();
    } catch (e) {
      console.error(e);
      alert("Failed to delete service.");
    }
  }

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Services Management" subtitle="Manage your wellness services and offerings">
      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button onClick={openAdd} className="btn-primary text-sm">
            ➕ Add New Service
          </button>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading services...</div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-400">No services found.</p>
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
              {filteredServices.map((service) => (
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
                    {service.enquiryMode ? (
                      <span className="text-tattvam-purple-600">Enquiry</span>
                    ) : (
                      service.price
                    )}
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
                      <button
                        onClick={() => openEdit(service)}
                        className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(service)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        {service.isVisible ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => handleDelete(service.id!)}
                        className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Duration</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 60 min"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ServiceRecord["category"] })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="Healing">Healing</option>
                    <option value="Coaching">Coaching</option>
                    <option value="Therapy">Therapy</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Primary Date</label>
                  <input
                    type="text"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="e.g. 15 May, 6:00 PM"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Additional Dates (comma separated)</label>
                  <input
                    type="text"
                    value={datesInput}
                    onChange={(e) => setDatesInput(e.target.value)}
                    placeholder="e.g. 16 May, 17 May"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enquiryMode"
                  checked={form.enquiryMode}
                  onChange={(e) => setForm({ ...form, enquiryMode: e.target.checked })}
                  className="h-4 w-4 rounded border-tattvam-purple-300 text-tattvam-purple-600"
                />
                <label htmlFor="enquiryMode" className="text-sm text-tattvam-purple-700">
                  Enquiry mode (shows WhatsApp button instead of price)
                </label>
              </div>
              {!form.enquiryMode && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Price</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. ₹1,999"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Outcomes (comma separated)</label>
                <input
                  type="text"
                  value={outcomesInput}
                  onChange={(e) => setOutcomesInput(e.target.value)}
                  placeholder="e.g. Clarity, Emotional balance, Self-awareness"
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={form.isVisible}
                  onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                  className="h-4 w-4 rounded border-tattvam-purple-300 text-tattvam-purple-600"
                />
                <label htmlFor="isVisible" className="text-sm text-tattvam-purple-700">
                  Visible on website
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary text-sm"
              >
                {editingService ? "Save Changes" : "Create Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
