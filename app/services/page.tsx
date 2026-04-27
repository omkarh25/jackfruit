import { PageShell } from "@/components/app-shell/page-shell";
import { ContentCard } from "@/components/cards/content-card";
import { RazorpayPaymentButton } from "@/components/payments/razorpay-payment-button";
import { services } from "@/lib/data";

const paymentButtonId = "pl_SiNXqS3vOzGc7l";

export default function ServicesPage() {
  return (
    <PageShell
      eyebrow="Services"
      title="Personal support when you need guidance"
      description="Choose a consultation or guided package, then continue into Razorpay payment and confirmation."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {services.map((service) => (
          <ContentCard key={service.id} title={service.title} description={service.description} badge={service.price} meta={service.duration}>
            <ul className="mb-5 list-inside list-disc space-y-2 text-sm text-jackfruit-deep/70">
              {service.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
            <RazorpayPaymentButton paymentButtonId={paymentButtonId} />
          </ContentCard>
        ))}
      </div>
    </PageShell>
  );
}