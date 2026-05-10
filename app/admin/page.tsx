import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { workshops, services, bookingSlots } from "@/lib/data";

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Dashboard"
      subtitle="Quick snapshot of your business performance"
    >
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="₹0"
          change="+0% from last month"
          changeType="neutral"
          icon="💰"
        />
        <StatCard
          title="Total Enrollments"
          value="0"
          change="Courses + Workshops"
          changeType="neutral"
          icon="🎓"
        />
        <StatCard
          title="Active 1:1 Clients"
          value="0"
          change="This week"
          changeType="neutral"
          icon="👥"
        />
        <StatCard
          title="Upcoming Sessions"
          value={String(workshops.filter((w) => w.format === "Live Zoom").length)}
          change="Workshops + Consultations"
          changeType="neutral"
          icon="📅"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upcoming Workshops */}
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">
            Upcoming Workshops
          </h2>
          <div className="mt-4 space-y-3">
            {workshops.filter((w) => w.format === "Live Zoom").map((workshop) => (
              <div
                key={workshop.id}
                className="flex items-center justify-between rounded-xl bg-tattvam-purple-50 p-4"
              >
                <div>
                  <p className="font-medium text-tattvam-purple-800">{workshop.title}</p>
                  <p className="text-sm text-tattvam-purple-500">{workshop.date}</p>
                </div>
                <span className="rounded-full bg-tattvam-gold-100 px-3 py-1 text-xs font-bold text-tattvam-gold-700">
                  {workshop.price}
                </span>
              </div>
            ))}
            {workshops.filter((w) => w.format === "Live Zoom").length === 0 && (
              <p className="text-sm text-tattvam-purple-400">No upcoming workshops</p>
            )}
          </div>
        </div>

        {/* Active Services */}
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">
            Active Services
          </h2>
          <div className="mt-4 space-y-3">
            {services.slice(0, 5).map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-xl bg-tattvam-purple-50 p-4"
              >
                <div>
                  <p className="font-medium text-tattvam-purple-800">{service.title}</p>
                  <p className="text-sm text-tattvam-purple-500">{service.duration}</p>
                </div>
                <span className="rounded-full bg-tattvam-gold-100 px-3 py-1 text-xs font-bold text-tattvam-gold-700">
                  {service.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Booking Slots */}
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">
            Available Booking Slots
          </h2>
          <div className="mt-4 space-y-3">
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

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">
            Quick Actions
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Add Workshop", href: "/admin/workshops", icon: "➕" },
              { label: "Add Service", href: "/admin/services", icon: "✨" },
              { label: "View Bookings", href: "/admin/consultations", icon: "📅" },
              { label: "Manage Users", href: "/admin/users", icon: "👥" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-xl bg-tattvam-purple-50 p-4 text-center transition hover:bg-tattvam-purple-100"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-medium text-tattvam-purple-700">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
