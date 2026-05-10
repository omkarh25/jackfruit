"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { getAllWorkshops, type WorkshopRecord } from "@/lib/db/workshops";
import { getAllServices, type ServiceRecord } from "@/lib/db/services";
import { getAllBookings, type BookingRecord } from "@/lib/db/bookings";
import { getAllPayments, type PaymentRecord } from "@/lib/db/payments";
import { bookingSlots } from "@/lib/data";

export default function AdminDashboardPage() {
  const [workshops, setWorkshops] = useState<WorkshopRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [w, s, b, p] = await Promise.all([
          getAllWorkshops(),
          getAllServices(),
          getAllBookings(),
          getAllPayments(),
        ]);
        setWorkshops(w);
        setServices(s);
        setBookings(b);
        setPayments(p);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === "captured")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const liveWorkshops = workshops.filter((w) => w.format === "Live Zoom");
  const upcomingBookings = bookings.filter((b) => b.status === "upcoming");

  return (
    <AdminShell title="Dashboard" subtitle="Quick snapshot of your business performance">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading dashboard data...</div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`₹${(totalRevenue / 100).toLocaleString("en-IN")}`}
              change="From captured payments"
              changeType="positive"
              icon="💰"
            />
            <StatCard
              title="Total Enrollments"
              value={String(bookings.length)}
              change="Courses + Workshops"
              changeType="neutral"
              icon="🎓"
            />
            <StatCard
              title="Active 1:1 Clients"
              value={String(upcomingBookings.length)}
              change="Upcoming bookings"
              changeType="neutral"
              icon="👥"
            />
            <StatCard
              title="Upcoming Sessions"
              value={String(liveWorkshops.length)}
              change="Live workshops"
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
                {liveWorkshops.length > 0 ? (
                  liveWorkshops.map((workshop) => (
                    <div
                      key={workshop.id}
                      className="flex items-center justify-between rounded-xl bg-tattvam-purple-50 p-4"
                    >
                      <div>
                        <p className="font-medium text-tattvam-purple-800">{workshop.title}</p>
                        <p className="text-sm text-tattvam-purple-500">{workshop.date}</p>
                      </div>
                      <span className="rounded-full bg-tattvam-gold-100 px-3 py-1 text-xs font-bold text-tattvam-gold-700">
                        ₹{workshop.price}
                      </span>
                    </div>
                  ))
                ) : (
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
                {services.length > 0 ? (
                  services.slice(0, 5).map((service) => (
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
                  ))
                ) : (
                  <p className="text-sm text-tattvam-purple-400">
                    No services found.{" "}
                    <a href="/admin/seed" className="text-tattvam-purple-600 underline">
                      Seed data first →
                    </a>
                  </p>
                )}
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
        </>
      )}
    </AdminShell>
  );
}
