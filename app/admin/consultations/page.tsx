import { AdminShell } from "@/components/admin/admin-shell";
import { bookingSlots } from "@/lib/data";

const mockBookings = [
  {
    id: "booking-1",
    clientName: "Priya Sharma",
    email: "priya@example.com",
    service: "Personal Wellness Consultation",
    date: "Mon, 29 Apr",
    time: "10:00 AM",
    status: "Upcoming",
    notes: "First-time client, interested in stress management",
  },
  {
    id: "booking-2",
    clientName: "Rahul Mehta",
    email: "rahul@example.com",
    service: "Tarot Card Reading",
    date: "Wed, 1 May",
    time: "5:30 PM",
    status: "Upcoming",
    notes: "Career guidance session",
  },
  {
    id: "booking-3",
    clientName: "Anita Desai",
    email: "anita@example.com",
    service: "Breathwork Reset Package",
    date: "Sat, 4 May",
    time: "11:30 AM",
    status: "Confirmed",
    notes: "Follow-up session",
  },
];

export default function AdminConsultationsPage() {
  return (
    <AdminShell
      title="1:1 Consultation Management"
      subtitle="View and manage all client bookings"
    >
      {/* Stats */}
      <div className="mb-6 grid gap-6 sm:grid-cols-4">
        {[
          { label: "Total Bookings", value: "3", icon: "📅" },
          { label: "Upcoming", value: "2", icon: "🔜" },
          { label: "Completed", value: "0", icon: "✅" },
          { label: "Cancelled", value: "0", icon: "❌" },
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
          <button className="btn-primary text-sm">
            ➕ Add Booking
          </button>
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

      {/* Bookings Table */}
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
            {mockBookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-tattvam-purple-800">{booking.clientName}</p>
                  <p className="text-sm text-tattvam-purple-500">{booking.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-tattvam-purple-600">{booking.service}</td>
                <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                  {booking.date} at {booking.time}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      booking.status === "Upcoming"
                        ? "bg-amber-100 text-amber-700"
                        : booking.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-tattvam-purple-100 text-tattvam-purple-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-tattvam-purple-500">{booking.notes}</td>
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

      {/* Availability Section */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">
          Time Slot Availability
        </h2>
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
