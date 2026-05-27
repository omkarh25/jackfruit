"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getAllBookings,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  type BookingRecord,
} from "@/lib/db/bookings";
import { bookingSlots } from "@/lib/data";

const emptyBooking: Omit<BookingRecord, "id" | "createdAt" | "updatedAt"> = {
  userId: "admin",
  serviceId: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  slotDate: "",
  slotTime: "",
  duration: "60 min",
  meetingLink: "",
  status: "upcoming",
  intakeNotes: "",
  internalNotes: "",
};

export default function AdminConsultationsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [form, setForm] = useState(emptyBooking);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setIsLoading(true);
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  function openAdd() {
    setEditingBooking(null);
    setForm(emptyBooking);
    setIsModalOpen(true);
  }

  function openEdit(booking: BookingRecord) {
    setEditingBooking(booking);
    setForm({
      userId: booking.userId,
      serviceId: booking.serviceId,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone || "",
      slotDate: booking.slotDate,
      slotTime: booking.slotTime,
      duration: booking.duration || "60 min",
      meetingLink: booking.meetingLink || "",
      status: booking.status,
      intakeNotes: booking.intakeNotes || "",
      internalNotes: booking.internalNotes || "",
    });
    setIsModalOpen(true);
  }

  async function handleSave() {
    try {
      if (editingBooking?.id) {
        await updateBooking(editingBooking.id, form);
      } else {
        await createBooking(form);
      }
      setIsModalOpen(false);
      await loadBookings();
    } catch (e) {
      console.error(e);
      alert("Failed to save booking. Please try again.");
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(id);
      await loadBookings();
    } catch (e) {
      console.error(e);
      alert("Failed to cancel booking.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await deleteBooking(id);
      await loadBookings();
    } catch (e) {
      console.error(e);
      alert("Failed to delete booking.");
    }
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || b.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <AdminShell title="1:1 Consultation Management" subtitle="View and manage all client bookings">
      {/* Stats */}
      <div className="mb-6 grid gap-6 sm:grid-cols-4">
        {[
          { label: "Total Bookings", value: String(bookings.length), icon: "📅" },
          { label: "Upcoming", value: String(upcomingCount), icon: "🔜" },
          { label: "Completed", value: String(completedCount), icon: "✅" },
          { label: "Cancelled", value: String(cancelledCount), icon: "❌" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-xs text-tattvam-purple-500">{stat.label}</p>
                <p className="font-serif text-2xl font-bold text-tattvam-purple-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button onClick={openAdd} className="btn-primary text-sm">
            ➕ Add Booking
          </button>
          <button className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50">
            📤 Export CSV
          </button>
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-tattvam-purple-200 bg-white px-4 py-3 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
          >
            <option>All Status</option>
            <option>Upcoming</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading bookings...</div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-400">No bookings yet.</p>
          <p className="mt-2 text-sm text-tattvam-purple-500">
            Bookings will appear here when clients make reservations.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-50">
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Client</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Service</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Date & Time</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Duration</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-tattvam-purple-800">{booking.clientName}</p>
                    <p className="text-sm text-tattvam-purple-500">{booking.clientEmail}</p>
                    {booking.clientPhone && (
                      <p className="text-sm text-tattvam-purple-400">{booking.clientPhone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">{booking.serviceId}</td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                    {booking.slotDate} at {booking.slotTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                    {booking.duration || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        booking.status === "upcoming"
                          ? "bg-amber-100 text-amber-700"
                          : booking.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(booking)}
                        className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200"
                      >
                        Edit
                      </button>
                      {booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(booking.id!)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === "cancelled" && (
                        <button
                          onClick={() => handleDelete(booking.id!)}
                          className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
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

      {/* Availability Section */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Time Slot Availability</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {bookingSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-xl bg-tattvam-purple-50 p-4"
            >
              <div>
                <p className="font-medium text-tattvam-purple-800">
                  {slot.date} at {slot.time}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  slot.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {slot.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
              {editingBooking ? "Edit Booking" : "Add Booking"}
            </h2>
            <div className="mt-6 grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Client Name</label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Client Email</label>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Phone Number</label>
                  <input
                    type="tel"
                    value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Service / Purpose</label>
                  <input
                    type="text"
                    value={form.serviceId}
                    onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                    placeholder="e.g. Tarot Reading"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Date</label>
                  <input
                    type="text"
                    value={form.slotDate}
                    onChange={(e) => setForm({ ...form, slotDate: e.target.value })}
                    placeholder="e.g. 15 May 2026"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Time</label>
                  <input
                    type="text"
                    value={form.slotTime}
                    onChange={(e) => setForm({ ...form, slotTime: e.target.value })}
                    placeholder="e.g. 6:00 PM"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
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
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as BookingRecord["status"] })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Meeting Link</label>
                <input
                  type="url"
                  value={form.meetingLink}
                  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                  placeholder="e.g. https://zoom.us/j/..."
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Internal Notes</label>
                <textarea
                  value={form.internalNotes}
                  onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                  rows={2}
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
                {editingBooking ? "Save Changes" : "Create Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
