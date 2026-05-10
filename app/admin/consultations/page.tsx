"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAllBookings, type BookingRecord } from "@/lib/db/bookings";
import { bookingSlots } from "@/lib/data";

export default function AdminConsultationsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

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
          <button className="btn-primary text-sm">➕ Add Booking</button>
          <button className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50">
            📤 Export CSV
          </button>
        </div>
        <div className="flex gap-3">
          <select className="rounded-full border border-tattvam-purple-200 bg-white px-4 py-3 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none">
            <option>All Status</option>
            <option>Upcoming</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <input
            type="text"
            placeholder="Search bookings..."
            className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading bookings...</div>
        </div>
      ) : bookings.length === 0 ? (
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
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Notes</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-tattvam-purple-800">{booking.clientName}</p>
                    <p className="text-sm text-tattvam-purple-500">{booking.clientEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">{booking.serviceId}</td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                    {booking.slotDate} at {booking.slotTime}
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
                  <td className="px-6 py-4 text-sm text-tattvam-purple-500">{booking.internalNotes || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200">
                        Edit
                      </button>
                      <button className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                        Cancel
                      </button>
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
    </AdminShell>
  );
}
