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
  venueLink: "",
  paymentRedirectUrl: "",
};

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<WorkshopRecord | null>(null);
  const [form, setForm] = useState(emptyWorkshop);
  const [datesInput, setDatesInput] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [view, setView] = useState<"active" | "archived">("active");

  useEffect(() => {
    loadWorkshops();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWorkshops() {
    setIsLoading(true);
    try {
      const data = await getAllWorkshops();
      setWorkshops(data);
    } catch (e) {
      console.error(e);
      showMessage("Failed to load workshops. Please refresh.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
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
      venueLink: workshop.venueLink || "",
      paymentRedirectUrl: workshop.paymentRedirectUrl || "",
    });
    setDatesInput(workshop.dates?.join(", ") || "");
    setIsModalOpen(true);
  }

  function validateForm(): string | null {
    if (!form.title.trim()) return "Please enter the workshop name.";
    if (!form.slug.trim()) return "Please enter the slug.";
    if (!form.description.trim()) return "Please enter the description.";
    if (!form.date.trim()) return "Date and start time are required.";
    if (!form.enquiryMode && form.price <= 0) return "Please enter a valid price.";
    if (!form.maxParticipants || form.maxParticipants <= 0) return "Please enter a valid capacity.";
    if (!form.location) return "Please select a location.";
    return null;
  }

  async function handleSave() {
    const error = validateForm();
    if (error) {
      showMessage(error, "error");
      return;
    }
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
        showMessage("Workshop updated successfully.", "success");
      } else {
        await createWorkshop(data);
        showMessage("Workshop created successfully.", "success");
      }
      setIsModalOpen(false);
      await loadWorkshops();
    } catch (e) {
      console.error(e);
      showMessage("Failed to save workshop. Please try again.", "error");
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Are you sure you want to archive this workshop?")) return;
    try {
      await updateWorkshop(id, { status: "archived" });
      showMessage("Workshop archived successfully.", "success");
      await loadWorkshops();
    } catch (e) {
      console.error(e);
      showMessage("Failed to archive workshop. Please try again.", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this workshop? This cannot be undone.")) return;
    try {
      await deleteWorkshop(id);
      showMessage("Workshop deleted successfully.", "success");
      await loadWorkshops();
    } catch (e) {
      console.error(e);
      showMessage("Failed to delete workshop. Please try again.", "error");
    }
  }

  const filteredWorkshops = workshops
    .filter((w) => w.title.toLowerCase().includes(search.toLowerCase()))
    .filter((w) => (view === "active" ? w.status !== "archived" : w.status === "archived"));

  return (
    <AdminShell title="Workshops Management" subtitle="Add, edit, and manage your workshops">
      {/* Message Toast */}
      {message && (
        <div
          className={`mb-4 rounded-xl px-5 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={openAdd} className="btn-primary text-sm">
            ➕ Add New Workshop
          </button>
          <div className="flex rounded-full border border-tattvam-purple-200 bg-white p-1">
            <button
              onClick={() => setView("active")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                view === "active"
                  ? "bg-tattvam-purple-100 text-tattvam-purple-700"
                  : "text-tattvam-purple-500 hover:text-tattvam-purple-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setView("archived")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                view === "archived"
                  ? "bg-tattvam-purple-100 text-tattvam-purple-700"
                  : "text-tattvam-purple-500 hover:text-tattvam-purple-700"
              }`}
            >
              Archived
            </button>
          </div>
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
          <p className="text-lg text-tattvam-purple-400">
            {view === "active" ? "No active workshops found." : "No archived workshops found."}
          </p>
          <p className="mt-2 text-sm text-tattvam-purple-400">
            {view === "active" ? "Add workshops using the button above." : "Archived workshops will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[640px] text-left">
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
                    <div className="flex flex-wrap gap-2">
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
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Primary Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="e.g. 15 May, 6:00 PM"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Additional Dates (comma separated)
                  </label>
                  <input
                    type="text"
                    value={datesInput}
                    onChange={(e) => setDatesInput(e.target.value)}
                    placeholder="e.g. 16 May, 17 May"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Format <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.format}
                    onChange={(e) => {
                      const newFormat = e.target.value as WorkshopRecord["format"];
                      setForm({
                        ...form,
                        format: newFormat,
                        location: newFormat === "Offline" ? "Offline" : form.location,
                      });
                    }}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="Live Zoom">Live Zoom</option>
                    <option value="Offline">Offline</option>
                    <option value="Recording">Recording</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Location <span className="text-red-500">*</span>
                  </label>
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
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Max Participants <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.maxParticipants}
                    onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Meeting Link (if online)</label>
                  <input
                    type="text"
                    value={form.whatsappLink || ""}
                    onChange={(e) => setForm({ ...form, whatsappLink: e.target.value })}
                    placeholder="e.g. https://zoom.us/j/..."
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
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
              {form.format === "Offline" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Venue Link (Optional)</label>
                  <input
                    type="text"
                    value={form.venueLink || ""}
                    onChange={(e) => setForm({ ...form, venueLink: e.target.value })}
                    placeholder="e.g. https://maps.google.com/..."
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Payment Redirect URL (Optional)</label>
                <input
                  type="text"
                  value={form.paymentRedirectUrl || ""}
                  onChange={(e) => setForm({ ...form, paymentRedirectUrl: e.target.value })}
                  placeholder="e.g. https://chat.whatsapp.com/..."
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
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
