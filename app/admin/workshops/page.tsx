"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getAllWorkshops,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  type WorkshopRecord,
} from "@/lib/db/workshops";

const emptyWorkshop: Omit<WorkshopRecord, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  slug: "",
  description: "",
  longDescription: "",
  date: "",
  format: "Live Zoom",
  price: 0,
  enquiryMode: false,
  maxParticipants: 20,
  location: "Online",
  imageUrl: "",
  whatsappLink: "https://wa.me/916363606088",
  registrationsEnabled: true,
  status: "active",
};

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<WorkshopRecord | null>(null);
  const [form, setForm] = useState(emptyWorkshop);
  const [datesInput, setDatesInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadWorkshops();
  }, []);

  async function loadWorkshops() {
    setIsLoading(true);
    try {
      const data = await getAllWorkshops();
      setWorkshops(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  function openAdd() {
    setEditingWorkshop(null);
    setForm(emptyWorkshop);
    setDatesInput("");
    setIsModalOpen(true);
  }

  function openEdit(workshop: WorkshopRecord) {
    setEditingWorkshop(workshop);
    setForm({
      title: workshop.title,
      slug: workshop.slug,
      description: workshop.description,
      longDescription: workshop.longDescription || "",
      date: workshop.date,
      format: workshop.format,
      price: workshop.price,
      enquiryMode: workshop.enquiryMode || false,
      maxParticipants: workshop.maxParticipants || 20,
      location: workshop.location || "Online",
      imageUrl: workshop.imageUrl || "",
      whatsappLink: workshop.whatsappLink || "https://wa.me/916363606088",
      registrationsEnabled: workshop.registrationsEnabled ?? true,
      status: workshop.status || "active",
    });
    setDatesInput(workshop.dates?.join(", ") || "");
    setIsModalOpen(true);
  }

  async function handleSave() {
    const data = {
      ...form,
      dates: datesInput
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
    };
    try {
      if (editingWorkshop?.id) {
        await updateWorkshop(editingWorkshop.id, data);
      } else {
        await createWorkshop(data);
      }
      setIsModalOpen(false);
      await loadWorkshops();
    } catch (e) {
      console.error(e);
      alert("Failed to save workshop. Please try again.");
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Are you sure you want to archive this workshop?")) return;
    try {
      await updateWorkshop(id, { status: "archived" });
      await loadWorkshops();
    } catch (e) {
      console.error(e);
      alert("Failed to archive workshop.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this workshop?")) return;
    try {
      await deleteWorkshop(id);
      await loadWorkshops();
    } catch (e) {
      console.error(e);
      alert("Failed to delete workshop.");
    }
  }

  const filteredWorkshops = workshops.filter((w) =>
    w.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Workshops Management" subtitle="Add, edit, and manage your workshops">
      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button onClick={openAdd} className="btn-primary text-sm">
            ➕ Add New Workshop
          </button>
          <button className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50">
            📤 Export CSV
          </button>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search workshops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading workshops...</div>
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-400">No workshops found.</p>
          <p className="mt-2 text-sm text-tattvam-purple-400">Add workshops using the button above.</p>
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
              {filteredWorkshops.map((workshop) => (
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
                    {workshop.enquiryMode ? (
                      <span className="text-tattvam-purple-600">Enquiry</span>
                    ) : (
                      `₹${workshop.price}`
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        workshop.status === "archived"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {workshop.status === "archived" ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(workshop)}
                        className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200"
                      >
                        Edit
                      </button>
                      {workshop.status !== "archived" ? (
                        <button
                          onClick={() => handleArchive(workshop.id!)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(workshop.id!)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
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
              {editingWorkshop ? "Edit Workshop" : "Add New Workshop"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value as WorkshopRecord["format"] })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="Live Zoom">Live Zoom</option>
                    <option value="Recording">Recording</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as WorkshopRecord["status"] })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
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
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Price (₹)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              )}
              {form.enquiryMode && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">WhatsApp Link</label>
                  <input
                    type="text"
                    value={form.whatsappLink}
                    onChange={(e) => setForm({ ...form, whatsappLink: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Max Participants</label>
                  <input
                    type="number"
                    value={form.maxParticipants}
                    onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Location</label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value as WorkshopRecord["location"] })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Image URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="registrationsEnabled"
                  checked={form.registrationsEnabled}
                  onChange={(e) => setForm({ ...form, registrationsEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-tattvam-purple-300 text-tattvam-purple-600"
                />
                <label htmlFor="registrationsEnabled" className="text-sm text-tattvam-purple-700">
                  Registrations enabled
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
                {editingWorkshop ? "Save Changes" : "Create Workshop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
