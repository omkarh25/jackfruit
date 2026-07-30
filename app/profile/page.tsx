"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/app-shell/page-shell";
import { DailyCheckin } from "@/components/dashboard/daily-checkin";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { MyPrograms, type ProgramItem } from "@/components/dashboard/my-programs";
import { AnandaMembership } from "@/components/dashboard/ananda-membership";
import { PaymentHistory } from "@/components/dashboard/payment-history";
import { ProfileInfo } from "@/components/dashboard/profile-info";
import { getBookingsByUser, getBookingsByEmail, getBookingById, type BookingRecord } from "@/lib/db/bookings";
import { getPaymentsByUser, type PaymentRecord } from "@/lib/db/payments";
import { getServiceById, getServiceBySlug } from "@/lib/db/services";
import { getWorkshopById, getWorkshopBySlug } from "@/lib/db/workshops";
import { getCourseById } from "@/lib/db/courses";
import { getCurrentMembership, type MembershipRecord } from "@/lib/db/memberships";
import type { MyAttendanceResponse } from "@/app/api/attendance/me/route";

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function getItemStatus(startDate: Date | null, endDate?: Date | null): ProgramItem["status"] {
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

export default function ProfilePage() {
  const { profile, firebaseUser } = useAuth();
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [membership, setMembership] = useState<MembershipRecord | null>(null);
  const [attendance, setAttendance] = useState<{ present: number; total: number; percentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser?.uid) return;
    loadUserData(firebaseUser.uid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  async function loadUserData(uid: string) {
    setIsLoading(true);
    try {
      const [userBookings, emailBookings, userPayments, currentMembership] = await Promise.all([
        getBookingsByUser(uid),
        profile?.email ? getBookingsByEmail(profile.email) : Promise.resolve([]),
        getPaymentsByUser(uid),
        getCurrentMembership(uid).catch((e) => {
          console.error("Failed to load membership:", e);
          return null;
        }),
      ]);

      setPayments(userPayments);
      setMembership(currentMembership);

      // Attendance summary via API (attendance records are admin-SDK only).
      try {
        const token = await firebaseUser?.getIdToken();
        const res = await fetch("/api/attendance/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: MyAttendanceResponse = await res.json();
        if (data.success && data.total != null) {
          setAttendance({ present: data.present || 0, total: data.total, percentage: data.percentage || 0 });
        }
      } catch (e) {
        console.error("Failed to load attendance summary:", e);
      }

      // Merge and deduplicate bookings by id
      const bookingMap = new Map<string, BookingRecord>();
      for (const b of userBookings) {
        if (b.id) bookingMap.set(b.id, b);
      }
      for (const b of emailBookings) {
        if (b.id) bookingMap.set(b.id, b);
      }
      const bookings = Array.from(bookingMap.values());

      const enriched: ProgramItem[] = [];

      for (const b of bookings) {
        // Skip pre-payment (unpaid) bookings — only paid ones belong on the dashboard.
        if (b.status === "pending") continue;
        const dateStr = `${b.slotDate} ${b.slotTime}`;
        const start = parseDate(dateStr);
        enriched.push({
          id: b.id || `booking-${b.slotDate}-${b.slotTime}`,
          title: b.serviceId || "1:1 Consultation",
          category: "consultation",
          date: dateStr,
          regDate: b.createdAt?.toDate?.().toISOString() || "",
          meetingLink: b.meetingLink,
          status: b.status === "cancelled" ? "Cancelled" : getItemStatus(start),
        });
      }

      for (const p of userPayments) {
        if (p.status !== "captured") continue;
        const regDate = p.createdAt?.toDate?.().toISOString() || "";
        let title = p.itemTitle || "Unknown";
        let date = "";
        let meetingLink: string | undefined;
        let category: ProgramItem["category"] = p.itemType as ProgramItem["category"];

        try {
          if (p.itemType === "workshop" && p.itemId) {
            // Services first (workshops were merged into services), legacy fallback.
            const svc = (await getServiceById(p.itemId)) || (await getServiceBySlug(p.itemId));
            if (svc) {
              title = svc.title;
              date = svc.date || "";
              meetingLink = svc.whatsappLink;
            } else {
              let ws = await getWorkshopById(p.itemId);
              if (!ws) {
                ws = await getWorkshopBySlug(p.itemId);
              }
              if (ws) {
                title = ws.title;
                date = ws.date;
                meetingLink = ws.whatsappLink;
              }
            }
          } else if (p.itemType === "consultation" && p.itemId) {
            const booking = await getBookingById(p.itemId);
            if (booking) {
              title = booking.serviceId || "1:1 Consultation";
              date = `${booking.slotDate} ${booking.slotTime}`;
              meetingLink = booking.meetingLink;
            }
            category = "consultation";
          } else if (p.itemType === "service" && p.itemId) {
            let svc = await getServiceById(p.itemId);
            if (!svc) {
              svc = await getServiceBySlug(p.itemId);
            }
            if (svc) {
              title = svc.title;
              date = svc.date || "";
            } else {
              // Backwards compatibility: older consultation payments were stored as "service".
              const booking = await getBookingById(p.itemId);
              if (booking) {
                title = booking.serviceId || "1:1 Consultation";
                date = `${booking.slotDate} ${booking.slotTime}`;
                meetingLink = booking.meetingLink;
                category = "consultation";
              }
            }
          } else if (p.itemType === "course" && p.itemId) {
            const course = await getCourseById(p.itemId);
            if (course) {
              title = course.title;
              date = regDate;
            }
          }
        } catch {
          // ignore lookup errors
        }

        const start = parseDate(date) || (p.createdAt ? new Date(p.createdAt.toDate()) : null);
        enriched.push({
          id: p.id || `payment-${p.itemId}`,
          title,
          category,
          date: date || regDate,
          regDate,
          amount: p.amount,
          meetingLink,
          status: getItemStatus(start),
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
                category: "course",
                date: new Date().toISOString(),
                regDate: "",
                status: "In Progress",
              });
            }
          } catch {
            // ignore
          }
        }
      }

      setItems(enriched);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  if (!firebaseUser) {
    return (
      <PageShell eyebrow="Dashboard" title="Your Dashboard" description="View all your enrollments and bookings">
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-700">Please sign in to view your dashboard.</p>
          <p className="mt-2 text-sm text-tattvam-purple-500">Use the login button in the navigation bar.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Dashboard"
      title={`Hello, ${profile?.name || "Seeker"}`}
      description="Your wellness journey at a glance."
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading your dashboard...</div>
        </div>
      ) : (
        <div className="space-y-8">
          <DailyCheckin userId={firebaseUser.uid} />
          <DashboardSummary membership={membership} programs={items} attendance={attendance} />
          <MyPrograms items={items} />
          <AnandaMembership membership={membership} />
          <PaymentHistory payments={payments} />
          <ProfileInfo />
        </div>
      )}
    </PageShell>
  );
}
