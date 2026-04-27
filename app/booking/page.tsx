import { PageShell } from "@/components/app-shell/page-shell";
import { ContentCard } from "@/components/cards/content-card";
import { RazorpayPaymentButton } from "@/components/payments/razorpay-payment-button";
import { bookingSlots } from "@/lib/data";

const paymentButtonId = "pl_SiNXqS3vOzGc7l";

export default function BookingPage() {
  return (
    <PageShell
      eyebrow="1:1 Booking"
      title="Reserve a personal consultation slot"
      description="Pick from available author slots. Payment confirmation can later reserve the slot automatically in the database."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {bookingSlots.map((slot) => (
            <ContentCard key={slot.id} title={`${slot.date} · ${slot.time}`} description="Personal consultation slot for wellness assessment and next-step planning." badge={slot.status} />
          ))}
        </div>
        <aside className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-jackfruit-deep">Confirm booking</h2>
          <p className="mt-3 text-jackfruit-deep/70">Use the Razorpay button to collect payment for the selected consultation flow.</p>
          <div className="mt-6">
            <RazorpayPaymentButton paymentButtonId={paymentButtonId} />
          </div>
        </aside>
      </div>
    </PageShell>
  );
}