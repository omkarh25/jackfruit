import type { Metadata } from "next";
import { PageShell } from "@/components/app-shell/page-shell";

// ─── SEO ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Terms & Conditions | Tattvam Niramaya",
  description:
    "Read the Tattvam Niramaya terms and conditions for using our website, services, consultations, courses, and digital communications.",
  alternates: { canonical: "/terms-conditions" },
  openGraph: {
    title: "Terms & Conditions | Tattvam Niramaya",
    description:
      "Read the Tattvam Niramaya terms and conditions for using our website, services, consultations, courses, and digital communications.",
    url: "https://tattvamniramaya.com/terms-conditions",
  },
};

/**
 * Static Terms & Conditions page.
 *
 * Content source: `webpgChanges/terms and conditions.md`.
 * Rendered as plain HTML sections (no raw markdown) so it matches the rest of
 * the site's design language. Update the markdown source first, then mirror
 * the changes here.
 */
export default function TermsConditionsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms & Conditions"
      description="The terms under which Tattvam Niramaya provides its website, services, consultations and digital communications."
    >
      <div className="prose prose-purple max-w-none text-tattvam-purple-700">
        <p className="text-sm text-tattvam-purple-500">
          Effective Date: July 9, 2026
        </p>

        <p className="mt-4">Welcome to Hema the Healer.</p>
        <p>
          These Terms and Conditions govern your use of our website located at{" "}
          <a
            href="https://tattvamniramaya.com"
            className="underline hover:text-tattvam-purple-800"
          >
            https://tattvamniramaya.com
          </a>{" "}
          and any services, consultations, programs, courses, content, WhatsApp
          communications, emails, and digital interactions provided by us.
        </p>
        <p>
          By accessing our website, submitting forms, booking services,
          communicating with us, or using any part of our website, you agree to
          be bound by these Terms and Conditions. If you do not agree with any
          part of these terms, please discontinue use of our website and
          services.
        </p>

        <Section title="Definitions">
          <p>Throughout these Terms and Conditions:</p>
          <ul>
            <li>&ldquo;Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Our&rdquo;, and &ldquo;Us&rdquo; refer to Hema The Healer.</li>
            <li>&ldquo;User&rdquo;, &ldquo;Client&rdquo;, &ldquo;You&rdquo;, and &ldquo;Your&rdquo; refer to any individual or entity accessing our website or services.</li>
            <li>&ldquo;Website&rdquo; refers to <a href="https://tattvamniramaya.com" className="underline hover:text-tattvam-purple-800">https://tattvamniramaya.com</a>.</li>
            <li>&ldquo;Services&rdquo; refer to consultations, courses, workshops, programs, digital content, communications, and any other offerings provided by us.</li>
          </ul>
        </Section>

        <Section title="Acceptance of Terms">
          <p>
            By accessing or using our website and services, you acknowledge that you have read,
            understood, and agreed to comply with these Terms and Conditions as well as our Privacy Policy.
          </p>
        </Section>

        <Section title="Use of Website">
          <p>
            You agree to use this website only for lawful purposes and in a manner that does not
            infringe upon the rights of others.
          </p>
          <p>You agree not to:</p>
          <ul>
            <li>Use the website for unlawful or fraudulent purposes.</li>
            <li>Attempt to gain unauthorized access to systems or data.</li>
            <li>Upload malicious software, viruses, or harmful code.</li>
            <li>Disrupt website functionality.</li>
            <li>Use website content without authorization.</li>
            <li>Misrepresent your identity or contact information.</li>
          </ul>
          <p>We reserve the right to suspend or terminate access if we believe a user has violated these terms.</p>
        </Section>

        <Section title="Communication Consent">
          <p>
            By submitting your contact details through our website, forms, event registrations,
            consultations, WhatsApp inquiries, email subscriptions, or any other communication channel,
            you expressly consent to receive communications from us through:
          </p>
          <ul>
            <li>WhatsApp</li>
            <li>SMS</li>
            <li>Email</li>
            <li>Phone calls</li>
            <li>Other digital communication channels</li>
          </ul>
          <p>These communications may include:</p>
          <ul>
            <li>Appointment confirmations</li>
            <li>Consultation reminders</li>
            <li>Service updates</li>
            <li>Customer support responses</li>
            <li>Educational content</li>
            <li>Event invitations</li>
            <li>Promotional offers</li>
            <li>Marketing communications</li>
            <li>Business announcements</li>
          </ul>
          <p>
            Your consent remains valid unless withdrawn through the opt-out methods described in these Terms.
          </p>
        </Section>

        <Section title="WhatsApp Communication Terms">
          <p>When communicating with us through WhatsApp:</p>
          <ul>
            <li>You consent to receive messages related to your inquiries, appointments, services, and promotions.</li>
            <li>Message frequency may vary depending on your interaction with us.</li>
            <li>Standard messaging and data charges imposed by your mobile service provider may apply.</li>
            <li>Communications may be processed through Meta Platforms, WhatsApp Business Platform, and authorized service providers.</li>
            <li>We reserve the right to discontinue WhatsApp communication with any user who violates these Terms.</li>
          </ul>
        </Section>

        <Section title="User Responsibilities">
          <p>By using our website and services, you agree that:</p>
          <ul>
            <li>All information provided by you is accurate, complete, and current.</li>
            <li>You will promptly update any changes to your contact information.</li>
            <li>You will not impersonate another individual or organization.</li>
            <li>You will not misuse our communication channels.</li>
            <li>You will not send abusive, threatening, offensive, defamatory, unlawful, or misleading messages.</li>
            <li>You will not attempt to interfere with our systems or services.</li>
          </ul>
          <p>We reserve the right to restrict or terminate access for users who fail to comply with these obligations.</p>
        </Section>

        <Section title="Intellectual Property Rights">
          <p>
            Unless otherwise stated, all content on this website — including but not limited to text,
            graphics, logos, images, videos, audio, and downloadable resources — is the property of Hema
            The Healer and is protected by applicable intellectual property laws.
          </p>
          <p>You may not:</p>
          <ul>
            <li>Reproduce, distribute, or modify any content without consent.</li>
            <li>Use our content for commercial purposes.</li>
            <li>Remove any copyright or trademark notices.</li>
          </ul>
        </Section>

        <Section title="Third-Party Links">
          <p>
            Our website may contain links to third-party websites. We are not responsible for the content,
            accuracy, or practices of any linked third-party sites. Accessing such links is at your own risk.
          </p>
        </Section>

        <Section title="Payments and Refunds">
          <ul>
            <li>All payments for services, consultations, courses, workshops, and programs must be made through the authorized payment gateways available on our website.</li>
            <li>Refunds, if applicable, are governed by our refund policy as communicated at the time of purchase.</li>
            <li>We reserve the right to modify pricing, offers, and discounts at any time without prior notice.</li>
          </ul>
        </Section>

        <Section title="Cancellation and Rescheduling">
          <p>
            Cancellations and rescheduling of consultations, sessions, workshops, or programs are subject
            to the policies communicated at the time of booking. Please refer to the specific product,
            service, or program page for applicable terms.
          </p>
        </Section>

        <Section title="Opt-Out and Withdrawal of Consent">
          <p>You may withdraw your consent to receive promotional or marketing communications at any time by:</p>
          <ul>
            <li>Replying &ldquo;STOP&rdquo; or &ldquo;UNSUBSCRIBE&rdquo; to WhatsApp communications</li>
            <li>Requesting removal via email</li>
            <li>Contacting our support team</li>
          </ul>
          <p>Upon receiving your request, we will make reasonable efforts to process your opt-out request promptly.</p>
          <p>Please note that service-related communications necessary for appointments, transactions, or active services may still be sent.</p>
        </Section>

        <Section title="Grievance Redressal">
          <p>
            If you have any concerns, complaints, disputes, or grievances regarding our services,
            communications, privacy practices, or website content, you may contact us using the
            details provided below.
          </p>
          <p>We will make reasonable efforts to acknowledge and address complaints within a reasonable timeframe.</p>

          <div className="mt-3 rounded-2xl bg-tattvam-purple-50 p-6 not-prose">
            <p className="font-semibold text-tattvam-purple-800">Contact Details:</p>
            <p className="mt-2 text-tattvam-purple-600">
              Email:{" "}
              <a href="mailto:hemathehealer@tattvamniramaya.com" className="underline hover:text-tattvam-purple-800">hemathehealer@tattvamniramaya.com</a>,{" "}
              <a href="mailto:astrotarothealer@gmail.com" className="underline hover:text-tattvam-purple-800">astrotarothealer@gmail.com</a>,{" "}
              <a href="mailto:drgittanjali@gmail.com" className="underline hover:text-tattvam-purple-800">drgittanjali@gmail.com</a>
            </p>
            <p className="mt-2 text-tattvam-purple-600">
              Phone: <span className="font-medium">+91 6363 6060 88</span> (India)
            </p>
            <p className="mt-2 text-tattvam-purple-600">
              Website: <a href="https://tattvamniramaya.com" className="underline hover:text-tattvam-purple-800">https://tattvamniramaya.com</a>
            </p>
          </div>
        </Section>

        <Section title="Limitation of Liability">
          <p>To the fullest extent permitted by law, Hema The Healer shall not be liable for:</p>
          <ul>
            <li>Any indirect, incidental, special, or consequential damages</li>
            <li>Loss of data, profits, revenue, goodwill, or business opportunities</li>
            <li>Delays or failures caused by third-party service providers</li>
            <li>Service interruptions beyond our control</li>
            <li>Unauthorized access by third parties</li>
            <li>Failures of telecommunications networks</li>
            <li>WhatsApp platform outages, delays, errors, restrictions, or security incidents</li>
            <li>Actions or omissions of Meta Platforms or any third-party messaging provider</li>
          </ul>
          <p>
            Users acknowledge that communication platforms such as WhatsApp operate independently, and
            we cannot guarantee uninterrupted availability, delivery, or security of such services.
          </p>
        </Section>

        <Section title="Disclaimer">
          <p>Information provided on this website is intended for informational and educational purposes only.</p>
          <p>While we strive to ensure accuracy, we do not guarantee:</p>
          <ul>
            <li>Completeness</li>
            <li>Accuracy</li>
            <li>Reliability</li>
            <li>Availability</li>
            <li>Suitability for any specific purpose</li>
          </ul>
          <p>Users should exercise their own judgment and seek professional advice where appropriate.</p>
        </Section>

        <Section title="Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless Hema The Healer, its employees,
            representatives, affiliates, and service providers from any claims, liabilities, damages,
            losses, expenses, or legal costs arising from:
          </p>
          <ul>
            <li>Violation of these Terms</li>
            <li>Misuse of our website or services</li>
            <li>Breach of applicable laws</li>
            <li>Infringement of third-party rights</li>
          </ul>
        </Section>

        <Section title="Privacy">
          <p>Your use of this website is also governed by our Privacy Policy.</p>
          <p>
            By using the website, you agree to the collection, use, and processing of information as
            described in the <a href="/privacy-policy" className="underline hover:text-tattvam-purple-800">Privacy Policy</a>.
          </p>
        </Section>

        <Section title="Changes to Terms and Policies">
          <p>We reserve the right to update, modify, or replace these Terms and Conditions and our Privacy Policy at any time.</p>
          <p>When material changes are made, we may notify users through:</p>
          <ul>
            <li>Website announcements</li>
            <li>Updated revision dates</li>
            <li>Email notifications where appropriate</li>
            <li>WhatsApp notifications where appropriate</li>
          </ul>
          <p>Continued use of the website or services following such updates constitutes acceptance of the revised Terms and Conditions.</p>
        </Section>

        <Section title="Governing Law">
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the
            applicable laws of the jurisdiction in which the business operates.
          </p>
          <p>Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the competent courts of that jurisdiction.</p>
        </Section>

        <Section title="Contact Us">
          <p>If you have any questions regarding these Terms and Conditions, please contact us:</p>
          <ul>
            <li>Website: <a href="https://tattvamniramaya.com" className="underline hover:text-tattvam-purple-800">https://tattvamniramaya.com</a></li>
            <li>Email: <a href="mailto:hemathehealer@tattvamniramaya.com" className="underline hover:text-tattvam-purple-800">hemathehealer@tattvamniramaya.com</a></li>
            <li>Phone: <span className="font-medium">+91 6363 6060 88</span> (India)</li>
          </ul>
        </Section>

        <p className="mt-8 text-sm text-tattvam-purple-500">
          These Terms and Conditions were last updated on July 9, 2026.
        </p>
      </div>
    </PageShell>
  );
}

/**
 * Small helper to keep section markup consistent across the page.
 */
function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl font-semibold text-tattvam-purple-900">
        {title}
      </h2>
      <div className="mt-3 space-y-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        {children}
      </div>
    </section>
  );
}
