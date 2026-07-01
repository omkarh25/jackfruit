"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/app-shell/page-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { ConsultationPayButton } from "@/components/payments/consultation-pay-button";
import { PaymentSuccessModal } from "@/components/payments/payment-success-modal";
import { getAvailableSlots, holdSlot, releaseSlot, type SlotRecord } from "@/lib/db/slots";
import { createBooking } from "@/lib/db/bookings";

function BookingContent({ serviceName }: { serviceName: string }) {
  const { firebaseUser, profile } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<SlotRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<SlotRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRedirectUrl, setSuccessRedirectUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSlots() {
    setIsLoading(true);
    try {
      const data = await getAvailableSlots();
      // Sort by date then time
      data.sort((a, b) => {
        const da = new Date(`${a.date}T${a.time}`);
        const db = new Date(`${b.date}T${b.time}`);
        return da.getTime() - db.getTime();
      });
      setSlots(data);
      if (data.length > 0) {
        setSelectedDate(data[0].date);
      }
    } catch (e) {
      console.error(e);
      showMessage("Failed to load available slots. Please refresh.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  const uniqueDates = Array.from(new Set(slots.map((s) => s.date)));
  const slotsForDate = slots.filter((s) => s.date === selectedDate);

  async function handleBookAndPay() {
    if (!selectedSlot || !firebaseUser || !profile) return;

    try {
      // 1. Hold the slot so another user can't book it while payment is in progress.
      await holdSlot(selectedSlot.id!, firebaseUser.uid);

      // 2. Create a pending booking record.
      const bookingId = await createBooking({
        userId: firebaseUser.uid,
        serviceId: serviceName,
        clientName: profile.name || "",
        clientEmail: profile.email || "",
        clientPhone: "",
        slotId: selectedSlot.id!,
        slotDate: selectedSlot.date,
        slotTime: selectedSlot.time,
        duration: selectedSlot.duration,
        meetingLink: selectedSlot.meetingLink || "",
        status: "upcoming",
        intakeNotes: "",
        internalNotes: "",
      });

      setCreatedBookingId(bookingId);
      setBookingConfirmed(true);
      showMessage("Slot reserved! Please complete payment below.", "success");
    } catch (e) {
      console.error(e);
      showMessage("Failed to reserve slot. It may have just been booked by someone else. Please try another slot.", "error");
      // Try to clean up in case the slot was held locally but booking failed.
      try {
        await releaseSlot(selectedSlot.id!);
      } catch {
        // ignore cleanup errors
      }
      await loadSlots();
    }
  }

  async function handlePaymentSuccess() {
    showMessage("Payment successful! Your booking is confirmed.", "success");
    let redirectUrl: string | undefined;
    try {
      const { getAllServices } = await import("@/lib/db/services");
      const allServices = await getAllServices();
      const match = allServices.find(
        (s) => s.title.toLowerCase() === serviceName.toLowerCase() || s.slug.toLowerCase() === serviceName.toLowerCase()
      );
      if (match?.paymentRedirectUrl) {
        redirectUrl = match.paymentRedirectUrl;
      }
    } catch (e) {
      console.error("Error finding service redirect URL:", e);
    }
    setSuccessRedirectUrl(redirectUrl);
    setShowSuccessModal(true);
  }

  async function handlePaymentFailure() {
    if (!selectedSlot || !createdBookingId || !firebaseUser) return;

    // Release the held slot and cancel the pending booking so the user can retry.
    try {
      await fetch("/api/booking/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id!,
          bookingId: createdBookingId,
          userId: firebaseUser.uid,
        }),
      });
    } catch (err) {
      console.error("Failed to release slot after payment failure:", err);
      // Fallback: try client-side release.
      try {
        await releaseSlot(selectedSlot.id!);
      } catch {
        // ignore
      }
    }

    setBookingConfirmed(false);
    setCreatedBookingId(null);
    showMessage("Payment was not completed. The slot has been released. You may try again.", "error");
    await loadSlots();
  }

  if (!firebaseUser) {
    return (
      <PageShell
        eyebrow="1:1 Booking"
        title="Reserve a personal consultation slot"
        description="Pick from available slots and book your session."
      >
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-700">Please sign in to book a consultation.</p>
          <p className="mt-2 text-sm text-tattvam-purple-500">Use the login button in the navigation bar.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="1:1 Booking"
      title="Reserve a personal consultation slot"
      description="Pick from available author slots. Select a date and time that works for you."
    >
      {message && (
        <div
          className={`mb-6 rounded-xl px-5 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {showSuccessModal && (
        <PaymentSuccessModal
          itemName={serviceName}
          itemType="consultation"
          redirectUrl={successRedirectUrl}
          onClose={() => {
            setShowSuccessModal(false);
            router.push("/profile");
          }}
        />
      )}

      {bookingConfirmed && selectedSlot && createdBookingId && firebaseUser ? (
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-soft">
          <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">Confirm Payment</h2>
          <div className="mt-4 rounded-xl bg-tattvam-purple-50 p-4">
            <p className="text-sm text-tattvam-purple-600">
              <span className="font-medium">Service:</span> {serviceName}
            </p>
            <p className="text-sm text-tattvam-purple-600">
              <span className="font-medium">Date:</span> {selectedSlot.date}
            </p>
            <p className="text-sm text-tattvam-purple-600">
              <span className="font-medium">Time:</span> {selectedSlot.time}
            </p>
            <p className="text-sm text-tattvam-purple-600">
              <span className="font-medium">Duration:</span> {selectedSlot.duration}
            </p>
            <p className="text-sm text-tattvam-purple-600">
              <span className="font-medium">Price:</span> ₹{selectedSlot.price}
            </p>
            {selectedSlot.meetingLink && (
              <p className="text-sm text-tattvam-purple-600">
                <span className="font-medium">Meeting Link:</span>{" "}
                <a href={selectedSlot.meetingLink} target="_blank" rel="noopener noreferrer" className="text-tattvam-purple-700 underline">
                  {selectedSlot.meetingLink}
                </a>
              </p>
            )}
          </div>
          <div className="mt-6">
            <ConsultationPayButton
              slotId={selectedSlot.id!}
              bookingId={createdBookingId}
              userId={firebaseUser.uid}
              customerName={profile?.name || firebaseUser.displayName || ""}
              customerEmail={profile?.email || firebaseUser.email || ""}
              serviceTitle={serviceName}
              price={selectedSlot.price}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
            />
          </div>
          <div className="mt-6 text-center">
            <Link href="/profile" className="text-sm font-medium text-tattvam-purple-600 underline hover:text-tattvam-purple-800">
              → Go to My Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-tattvam-purple-400">Loading slots...</div>
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
                <p className="text-lg text-tattvam-purple-400">No available slots right now.</p>
                <p className="mt-2 text-sm text-tattvam-purple-500">Please check back later or contact us.</p>
              </div>
            ) : (
              <>
                {/* Date picker */}
                <div className="rounded-2xl bg-white p-6 shadow-soft">
                  <h2 className="mb-4 font-serif text-lg font-bold text-tattvam-purple-900">Select a Date</h2>
                  <div className="flex flex-wrap gap-2">
                    {uniqueDates.map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
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
                </div>

                {/* Slots for selected date */}
                <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
                  <h2 className="mb-4 font-serif text-lg font-bold text-tattvam-purple-900">Available Slots</h2>
                  {slotsForDate.length === 0 ? (
                    <p className="text-sm text-tattvam-purple-400">No slots available for this date.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {slotsForDate.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl border p-4 text-left transition ${
                            selectedSlot?.id === slot.id
                              ? "border-tattvam-purple-400 bg-tattvam-purple-50"
                              : "border-tattvam-purple-100 bg-white hover:bg-tattvam-purple-50/50"
                          }`}
                        >
                          <p className="font-medium text-tattvam-purple-800">{slot.time}</p>
                          <p className="text-xs text-tattvam-purple-600">{slot.duration}</p>
                          <p className="mt-1 text-sm font-semibold text-tattvam-gold-600">₹{slot.price}</p>
                          {slot.meetingLink && (
                            <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              Online
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar summary */}
          <aside className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-tattvam-purple-900">Booking Summary</h2>
            {selectedSlot ? (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-tattvam-purple-600">Service</span>
                  <span className="font-medium text-tattvam-purple-800">{serviceName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tattvam-purple-600">Date</span>
                  <span className="font-medium text-tattvam-purple-800">{selectedSlot.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tattvam-purple-600">Time</span>
                  <span className="font-medium text-tattvam-purple-800">{selectedSlot.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tattvam-purple-600">Duration</span>
                  <span className="font-medium text-tattvam-purple-800">{selectedSlot.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tattvam-purple-600">Price</span>
                  <span className="font-medium text-tattvam-purple-800">₹{selectedSlot.price}</span>
                </div>
                {selectedSlot.meetingLink && (
                  <div className="flex justify-between text-sm">
                    <span className="text-tattvam-purple-600">Meeting</span>
                    <a
                      href={selectedSlot.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-tattvam-purple-700 underline"
                    >
                      Link ↗
                    </a>
                  </div>
                )}
                <div className="divider-gold my-4" />
                <button
                  onClick={handleBookAndPay}
                  className="btn-primary w-full text-sm"
                >
                  Book & Pay Now
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-tattvam-purple-400">
                Select a slot from the calendar to see the summary here.
              </p>
            )}
          </aside>
        </div>
      )}
    </PageShell>
  );
}

function SearchParamsWrapper() {
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("service") || "1:1 Consultation";
  return <BookingContent serviceName={serviceName} />;
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <PageShell eyebrow="1:1 Booking" title="Reserve a personal consultation slot" description="Loading...">
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading...</div>
        </div>
      </PageShell>
    }>
      <SearchParamsWrapper />
    </Suspense>
  );
}
