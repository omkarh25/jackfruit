"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/app-shell/page-shell";
import { getBookingsByUser, getBookingsByEmail, type BookingRecord } from "@/lib/db/bookings";
import { getPaymentsByUser, type PaymentRecord } from "@/lib/db/payments";
import { getWorkshopById } from "@/lib/db/workshops";
import { getServiceById } from "@/lib/db/services";
import { getCourseById } from "@/lib/db/courses";

interface EnrichedItem {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  meetingLink?: string;
  status: "Upcoming" | "In Progress" | "Completed" | "Cancelled";
  category: "workshop" | "service" | "consultation" | "course";
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function getItemStatus(startDate: Date | null, endDate?: Date | null): EnrichedItem["status"] {
  if (!startDate) return "Upcoming";
  const now = new Date();
  if (endDate) {
    if (now < startDate) return "Upcoming";
    if (now >= startDate && now <= endDate) return "In Progress";
    return "Completed";
  }
  const effectiveEnd = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  if (now < startDate) return "Upcoming";
  if (now >= startDate && now <= effectiveEnd) return "In Progress";
  return "Completed";
}

function formatLocalDate(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ProfilePage() {
  const { profile, firebaseUser } = useAuth();
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser?.uid) return;
    loadUserData(firebaseUser.uid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  async function loadUserData(uid: string) {
    setIsLoading(true);
    try {
      const [userBookings, emailBookings, payments] = await Promise.all([
        getBookingsByUser(uid),
        profile?.email ? getBookingsByEmail(profile.email) : Promise.resolve([]),
        getPaymentsByUser(uid),
      ]);

      // Merge and deduplicate bookings by id
      const bookingMap = new Map<string, BookingRecord>();
      for (const b of userBookings) {
        if (b.id) bookingMap.set(b.id, b);
      }
      for (const b of emailBookings) {
        if (b.id) bookingMap.set(b.id, b);
      }
      const bookings = Array.from(bookingMap.values());

      const enriched: EnrichedItem[] = [];

      for (const b of bookings) {
        const dateStr = `${b.slotDate} ${b.slotTime}`;
        const start = parseDate(dateStr);
        enriched.push({
          id: b.id || `booking-${b.slotDate}-${b.slotTime}`,
          title: b.serviceId || "1:1 Consultation",
          date: dateStr,
          meetingLink: b.meetingLink,
          status: b.status === "cancelled" ? "Cancelled" : getItemStatus(start),
          category: "consultation",
        });
      }

      for (const p of payments) {
        if (p.status !== "captured") continue;
        let title = p.itemTitle || "Unknown";
        let date = "";
        let meetingLink: string | undefined;

        try {
          if (p.itemType === "workshop" && p.itemId) {
            const ws = await getWorkshopById(p.itemId);
            if (ws) {
              title = ws.title;
              date = ws.date;
              meetingLink = ws.whatsappLink;
            }
          } else if (p.itemType === "service" && p.itemId) {
            const svc = await getServiceById(p.itemId);
            if (svc) {
              title = svc.title;
              date = svc.date || "";
            }
          } else if (p.itemType === "course" && p.itemId) {
            const course = await getCourseById(p.itemId);
            if (course) {
              title = course.title;
              date = p.createdAt?.toDate?.().toISOString() || "";
            }
          }
        } catch {
          // ignore lookup errors
        }

        const start = parseDate(date) || (p.createdAt ? new Date(p.createdAt.toDate()) : null);
        enriched.push({
          id: p.id || `payment-${p.itemId}`,
          title,
          date: date || (p.createdAt ? new Date(p.createdAt.toDate()).toISOString() : ""),
          meetingLink,
          status: getItemStatus(start),
          category: p.itemType as EnrichedItem["category"],
        });
      }

      if (profile?.purchasedCourseIds) {
        for (const courseId of profile.purchasedCourseIds) {
          try {
            const course = await getCourseById(courseId);
            if (course) {
              enriched.push({
                id: `local-course-${courseId}`,
                title: course.title,
                date: new Date().toISOString(),
                status: "In Progress",
                category: "course",
              });
            }
          } catch {
            // ignore
          }
        }
      }

      setItems(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (!firebaseUser) {
    return (
      <PageShell eyebrow="Profile" title="Your Profile" description="View all your enrollments and bookings">
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-700">Please sign in to view your profile.</p>
          <p className="mt-2 text-sm text-tattvam-purple-500">Use the login button in the navigation bar.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Profile"
      title={`Hello, ${profile?.name || "Seeker"}`}
      description="Here is everything you have enrolled in and booked."
    >
      <div className="mb-8 flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-tattvam-gold-400">
          {profile?.photoURL ? (
            <Image src={profile.photoURL} alt={profile.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-tattvam-purple-100 text-xl font-bold text-tattvam-purple-700">
              {(profile?.name || "?")[0]}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-tattvam-purple-500">{profile?.email}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading your profile...</div>
        </div>
      ) : (
        <div className="space-y-10">
          <ProfileSection title="Workshops" items={items.filter((i) => i.category === "workshop")} />
          <ProfileSection title="Services" items={items.filter((i) => i.category === "service")} />
          <ProfileSection title="1:1 Consultations" items={items.filter((i) => i.category === "consultation")} />
          <ProfileSection title="Courses" items={items.filter((i) => i.category === "course")} />
        </div>
      )}
    </PageShell>
  );
}

function ProfileSection({ title, items }: { title: string; items: EnrichedItem[] }) {
  const [tab, setTab] = useState<"current" | "past">("current");

  const currentItems = items.filter((i) => i.status === "Upcoming" || i.status === "In Progress");
  const pastItems = items.filter((i) => i.status === "Completed" || i.status === "Cancelled");
  const displayItems = tab === "current" ? currentItems : pastItems;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">{title}</h2>
        <div className="flex rounded-full border border-tattvam-purple-200 bg-white p-1">
          <button
            onClick={() => setTab("current")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === "current"
                ? "bg-tattvam-purple-100 text-tattvam-purple-700"
                : "text-tattvam-purple-500 hover:text-tattvam-purple-700"
            }`}
          >
            Current ({currentItems.length})
          </button>
          <button
            onClick={() => setTab("past")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === "past"
                ? "bg-tattvam-purple-100 text-tattvam-purple-700"
                : "text-tattvam-purple-500 hover:text-tattvam-purple-700"
            }`}
          >
            Past ({pastItems.length})
          </button>
        </div>
      </div>

      {displayItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-tattvam-purple-400">
          No {tab === "current" ? "upcoming" : "past"} {title.toLowerCase()}.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item) => (
            <div key={item.id} className="rounded-xl bg-tattvam-purple-50 p-4">
              <p className="font-medium text-tattvam-purple-800">{item.title}</p>
              {item.date && (
                <p className="mt-1 text-xs text-tattvam-purple-600">{formatLocalDate(item.date)}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    item.status === "Upcoming"
                      ? "bg-amber-100 text-amber-700"
                      : item.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : item.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              {item.meetingLink && (
                <a
                  href={item.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block rounded-lg bg-tattvam-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-tattvam-purple-700"
                >
                  Join Meeting ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
