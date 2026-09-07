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
import {
  getAllSlots,
  createSlot,
  updateSlot,
  deleteSlot,
  type SlotRecord,
} from "@/lib/db/slots";
import { getUserByEmail, getAllUsers, type FirestoreUserProfile } from "@/lib/db/users";
import { useAuth } from "@/components/auth/auth-provider";
import type { SlotSeedResult } from "@/lib/db/slot-seeding";

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

const TIME_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? "00" : "30";
  const labelHour = hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  const label = `${labelHour}:${minute} ${ampm}`;
  const value = `${String(hour).padStart(2, "0")}:${minute}`;
  return { label, value };
});

const emptySlot: Omit<SlotRecord, "id" | "createdAt" | "updatedAt"> = {
  date: "",
  time: "",
  duration: "60 min",
  price: 0,
  meetingLink: "",
  status: "available",
};

const statusOrder: Record<string, number> = { upcoming: 0, completed: 1, cancelled: 2, no_show: 3 };

export default function AdminConsultationsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [slots, setSlots] = useState<SlotRecord[]>([]);
  const [users, setUsers] = useState<FirestoreUserProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [editingSlot, setEditingSlot] = useState<SlotRecord | null>(null);
  const [bookingForm, setBookingForm] = useState(emptyBooking);
  const [slotForm, setSlotForm] = useState(emptySlot);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Bulk-slot-generation state.
  const { firebaseUser } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [lastSeedResult, setLastSeedResult] =
    useState<(SlotSeedResult & { error?: string }) | null>(null);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [b, s, u] = await Promise.all([getAllBookings(), getAllSlots(), getAllUsers()]);
      setBookings(b);
      s.sort((a, b) => {
        const da = new Date(`${a.date}T${a.time}`);
        const db = new Date(`${b.date}T${b.time}`);
        return da.getTime() - db.getTime();
      });
      setSlots(s);
      setUsers(u);
      if (s.length > 0) {
        setSelectedDate(s[0].date);
      }
    } catch (e) {
      console.error(e);
      showMessage("Failed to load data. Please refresh.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  function openAddBooking() {
    setEditingBooking(null);
    setBookingForm(emptyBooking);
    setUserSearch("");
    setIsBookingModalOpen(true);
  }

  function openEditBooking(booking: BookingRecord) {
    setEditingBooking(booking);
    setBookingForm({
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
    setUserSearch(booking.clientName || booking.clientEmail || "");
    setIsBookingModalOpen(true);
  }

  async function handleSaveBooking() {
    try {
      const data = { ...bookingForm };
      // Try to link booking to actual user by email
      if (data.clientEmail.trim()) {
        try {
          const user = await getUserByEmail(data.clientEmail.trim());
          if (user) {
            data.userId = user.uid;
          }
        } catch {
          // ignore lookup errors
        }
      }
      if (editingBooking?.id) {
        await updateBooking(editingBooking.id, data);
        showMessage("Booking updated successfully.", "success");
      } else {
        await createBooking(data);
        showMessage("Booking created successfully.", "success");
      }
      setIsBookingModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to save booking. Please try again.", "error");
    }
  }

  async function handleCancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(id);
      showMessage("Booking cancelled successfully.", "success");
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to cancel booking.", "error");
    }
  }

  async function handleDeleteBooking(id: string) {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await deleteBooking(id);
      showMessage("Booking deleted successfully.", "success");
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to delete booking.", "error");
    }
  }

  function openAddSlot() {
    setEditingSlot(null);
    setSlotForm(emptySlot);
    setIsSlotModalOpen(true);
  }

  function openEditSlot(slot: SlotRecord) {
    setEditingSlot(slot);
    setSlotForm({
      date: slot.date,
      time: slot.time,
      duration: slot.duration,
      price: slot.price,
      meetingLink: slot.meetingLink || "",
      status: slot.status,
    });
    setIsSlotModalOpen(true);
  }

  function validateSlot(): string | null {
    if (!slotForm.date.trim()) return "Please enter a date.";
    if (!slotForm.time.trim()) return "Please enter a time.";
    if (!slotForm.duration.trim()) return "Please enter a duration.";
    if (slotForm.price <= 0) return "Please enter a valid price.";
    // Check overlap, excluding the slot currently being edited
    const sameDateSlots = slots.filter((s) => s.date === slotForm.date && s.id !== editingSlot?.id);
    for (const s of sameDateSlots) {
      if (s.time === slotForm.time) {
        return `A slot already exists at ${slotForm.date} ${slotForm.time}.`;
      }
    }
    return null;
  }

  async function handleSaveSlot() {
    const error = validateSlot();
    if (error) {
      showMessage(error, "error");
      return;
    }
    try {
      if (editingSlot?.id) {
        await updateSlot(editingSlot.id, slotForm);
        showMessage("Slot updated successfully.", "success");
      } else {
        await createSlot(slotForm);
        showMessage("Slot created successfully.", "success");
      }
      setIsSlotModalOpen(false);
      setSlotForm(emptySlot);
      setEditingSlot(null);
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to save slot. Please try again.", "error");
    }
  }

  async function handleDeleteSlot(id: string) {
    if (!confirm("Are you sure you want to delete this slot?")) return;
    try {
      await deleteSlot(id);
      showMessage("Slot deleted successfully.", "success");
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to delete slot.", "error");
    }
  }

  /**
   * Bulk-create September consultation slots via the admin API.
   *
   * Confirms with the user (typical run: ~150 slots) and surfaces a clear
   * success/error banner. The API endpoint is admin-auth-protected; a missing
   * token there produces a 401 which we surface as a friendly error.
   */
  async function handleBulkSeed() {
    const ok = confirm(
      "Generate September consultation slots?\n\n" +
        "• Mon–Thu\n" +
        "• 11:00 AM – 4:00 PM\n" +
        "• 30-minute slots\n" +
        "• ₹555 per slot\n\n" +
        "Existing slots in that range will be skipped (idempotent)."
    );
    if (!ok) return;

    setIsSeeding(true);
    setLastSeedResult(null);
    try {
      const token = await firebaseUser?.getIdToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/admin/seed-slots", {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLastSeedResult({
          created: 0,
          skippedExisting: 0,
          days: 0,
          slotsPerDay: 0,
          errors: [],
          error: data.error || `Request failed with status ${res.status}`,
        });
        return;
      }
      setLastSeedResult({
        created: data.created,
        skippedExisting: data.skippedExisting,
        days: data.days,
        slotsPerDay: data.slotsPerDay,
        errors: data.errors ?? [],
      });
      await loadData();
    } catch (err) {
      console.error(err);
      setLastSeedResult({
        created: 0,
        skippedExisting: 0,
        days: 0,
        slotsPerDay: 0,
        errors: [],
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSeeding(false);
    }
  }

  const filteredBookings = bookings.filter((b) => {
    // Hide transient pre-payment bookings; the sweep cancels them after 15 min.
    if (b.status === "pending") return false;
    const matchesSearch =
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || b.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const groupedBookings = (() => {
    const groups: Record<string, BookingRecord[]> = {};
    for (const b of filteredBookings) {
      if (!groups[b.slotDate]) groups[b.slotDate] = [];
      groups[b.slotDate].push(b);
    }
    for (const date of Object.keys(groups)) {
      groups[date].sort((a, b) => (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4));
    }
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, items]) => ({ date, items }));
  })();

  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  const uniqueDates = Array.from(new Set(slots.map((s) => s.date)));
  const slotsForDate = slots.filter((s) => s.date === selectedDate);

  return (
    <AdminShell title="1:1 Consultation Management" subtitle="Manage availability slots and client bookings">
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

      {/* Slot Availability Section */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Availability Slots</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkSeed}
              disabled={isSeeding}
              className="rounded-full border border-tattvam-gold-400 bg-tattvam-gold-50 px-4 py-2 text-sm font-semibold text-tattvam-gold-700 transition hover:bg-tattvam-gold-100 disabled:cursor-not-allowed disabled:opacity-60"
              title="Bulk-create September slots: Mon–Thu, 11:00–16:00, 30 min, ₹555 each."
            >
              {isSeeding ? "Generating…" : "✨ Generate September Slots"}
            </button>
            <button onClick={openAddSlot} className="btn-primary text-sm">
              ➕ Add Slot
            </button>
          </div>
        </div>

        {lastSeedResult && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-xs ${
              lastSeedResult.error
                ? "bg-red-50 text-red-700"
                : "bg-tattvam-gold-50 text-tattvam-gold-800"
            }`}
          >
            {lastSeedResult.error
              ? `Bulk seed failed: ${lastSeedResult.error}`
              : `Bulk seed complete — ${lastSeedResult.created} new slot${
                  lastSeedResult.created === 1 ? "" : "s"
                } created across ${lastSeedResult.days} day${
                  lastSeedResult.days === 1 ? "" : "s"
                }${
                  lastSeedResult.skippedExisting
                    ? `, ${lastSeedResult.skippedExisting} already existed (skipped)`
                    : ""
                }.`}
          </div>
        )}

        {slots.length === 0 ? (
          <p className="text-sm text-tattvam-purple-400">No slots created yet. Add slots to make them available for booking.</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {uniqueDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedDate === date
                      ? "bg-tattvam-purple-600 text-white"
                      : "border border-tattvam-purple-200 bg-white text-tattvam-purple-700 hover:bg-tattvam-purple-50"
                  }`}
                >
                  {new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slotsForDate.map((slot) => (
                <div
                  key={slot.id}
                  className={`rounded-xl border p-4 ${
                    slot.status === "available"
                      ? "border-green-200 bg-green-50"
                      : slot.status === "booked"
                      ? "border-tattvam-purple-200 bg-tattvam-purple-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-tattvam-purple-800">{slot.time}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        slot.status === "available"
                          ? "bg-green-100 text-green-700"
                          : slot.status === "booked"
                          ? "bg-tattvam-purple-100 text-tattvam-purple-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>
                  <p className="text-xs text-tattvam-purple-600">{slot.duration}</p>
                  <p className="mt-1 text-sm font-semibold text-tattvam-gold-600">₹{slot.price}</p>
                  {slot.meetingLink && (
                    <p className="mt-1 text-xs text-tattvam-purple-500 truncate">
                      Link: {slot.meetingLink}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditSlot(slot)}
                      className="rounded-lg bg-tattvam-purple-100 px-2 py-1 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200"
                    >
                      Edit
                    </button>
                    {slot.status === "available" && (
                      <button
                        onClick={() => handleDeleteSlot(slot.id!)}
                        className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bookings Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <button onClick={openAddBooking} className="btn-primary text-sm">
            ➕ Add Booking
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
        <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[640px] text-left">
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
            {groupedBookings.map(({ date, items }) => (
              <tbody key={date}>
                <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-100/70">
                  <td
                    colSpan={6}
                    className="px-6 py-2 text-sm font-semibold text-tattvam-purple-800"
                  >
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                </tr>
                {items.map((booking) => (
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEditBooking(booking)}
                          className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200"
                        >
                          Edit
                        </button>
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancelBooking(booking.id!)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        )}
                        {booking.status === "cancelled" && (
                          <button
                            onClick={() => handleDeleteBooking(booking.id!)}
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
            ))}
          </table>
        </div>
      )}

      {/* Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
              {editingSlot ? "Edit Availability Slot" : "Add Availability Slot"}
            </h2>
            <div className="mt-6 grid gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={slotForm.date}
                    onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={slotForm.time}
                    onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={slotForm.duration}
                    onChange={(e) => setSlotForm({ ...slotForm, duration: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="30 min">30 min</option>
                    <option value="60 min">60 min</option>
                    <option value="90 min">90 min</option>
                    <option value="120 min">120 min</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={slotForm.price}
                    onChange={(e) => setSlotForm({ ...slotForm, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Meeting Link (optional)</label>
                <input
                  type="url"
                  value={slotForm.meetingLink}
                  onChange={(e) => setSlotForm({ ...slotForm, meetingLink: e.target.value })}
                  placeholder="e.g. https://zoom.us/j/..."
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsSlotModalOpen(false);
                  setEditingSlot(null);
                  setSlotForm(emptySlot);
                }}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
              <button onClick={handleSaveSlot} className="btn-primary text-sm">
                {editingSlot ? "Save Changes" : "Create Slot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
              {editingBooking ? "Edit Booking" : "Add Booking"}
            </h2>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                  Registered Client (optional)
                </label>
                <input
                  list="registered-users"
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUserSearch(value);
                    const user = users.find((u) => u.email === value || u.name === value);
                    if (user) {
                      setBookingForm({
                        ...bookingForm,
                        userId: user.uid,
                        clientName: user.name || "",
                        clientEmail: user.email || "",
                        clientPhone: user.phone || "",
                      });
                    }
                  }}
                  placeholder="Search by name or email..."
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
                <datalist id="registered-users">
                  {users.map((u) => (
                    <option key={u.uid} value={u.email}>
                      {u.name}
                    </option>
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-tattvam-purple-500">
                  Selecting a user prefills the fields below. You can still edit them manually.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Client Name</label>
                  <input
                    type="text"
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Client Email</label>
                  <input
                    type="email"
                    value={bookingForm.clientEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Phone Number</label>
                  <input
                    type="tel"
                    value={bookingForm.clientPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Service / Purpose</label>
                  <input
                    type="text"
                    value={bookingForm.serviceId}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceId: e.target.value })}
                    placeholder="e.g. Tarot Reading"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Date</label>
                  <input
                    type="date"
                    value={bookingForm.slotDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, slotDate: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Time</label>
                  <select
                    value={bookingForm.slotTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, slotTime: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="">Select time</option>
                    {TIME_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Duration</label>
                  <input
                    type="text"
                    value={bookingForm.duration}
                    onChange={(e) => setBookingForm({ ...bookingForm, duration: e.target.value })}
                    placeholder="e.g. 60 min"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Status</label>
                  <select
                    value={bookingForm.status}
                    onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value as BookingRecord["status"] })}
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
                  value={bookingForm.meetingLink}
                  onChange={(e) => setBookingForm({ ...bookingForm, meetingLink: e.target.value })}
                  placeholder="e.g. https://zoom.us/j/..."
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Internal Notes</label>
                <textarea
                  value={bookingForm.internalNotes}
                  onChange={(e) => setBookingForm({ ...bookingForm, internalNotes: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
              <button onClick={handleSaveBooking} className="btn-primary text-sm">
                {editingBooking ? "Save Changes" : "Create Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
