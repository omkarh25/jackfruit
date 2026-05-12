import { PageShell } from "@/components/app-shell/page-shell";

export const metadata = {
  title: "Privacy Policy | Tattvam Niramaya",
  description: "Privacy policy for HemaTheHealer and Tattvam Niramaya.",
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="How we collect, use, and protect your personal information."
    >
      <div className="prose prose-purple max-w-none">
        <p className="text-sm text-tattvam-purple-500">
          Effective Date: November 19, 2025
        </p>

        <p className="mt-4 text-tattvam-purple-700">
          At HemaTheHealer, your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your personal information when you engage with our services,
          workshops, and advertisements.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-tattvam-purple-900">
            1. Information We Collect
          </h2>
          <p className="mt-2 text-tattvam-purple-700">
            When you sign up through our forms or interact with our advertisements, we may collect
            the following information:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-tattvam-purple-700">
            <li>Name</li>
            <li>Phone number</li>
            <li>
              Any responses you voluntarily provide (such as areas of concern like relationships,
              money, or health)
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-tattvam-purple-900">
            2. How We Use Your Information
          </h2>
          <p className="mt-2 text-tattvam-purple-700">
            The information collected is used solely for the following purposes:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-tattvam-purple-700">
            <li>To contact you regarding the workshop or services you have shown interest in</li>
            <li>To understand your needs and provide relevant guidance</li>
            <li>
              To share important updates, session details, and support related to your registration
            </li>
          </ul>
          <p className="mt-3 text-tattvam-purple-700">
            We do not use your information for unrelated marketing or third-party promotions.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-tattvam-purple-900">3. Data Protection</h2>
          <p className="mt-2 text-tattvam-purple-700">
            We are committed to ensuring that your information is secure. Your personal data is
            handled with strict confidentiality and reasonable safeguards are in place to prevent
            unauthorized access, disclosure, or misuse.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-tattvam-purple-900">
            4. Sharing of Information
          </h2>
          <p className="mt-2 text-tattvam-purple-700">
            We do not sell, rent, or trade your personal information to third parties.
          </p>
          <p className="mt-2 text-tattvam-purple-700">
            Your information may only be shared with trusted internal team members solely for the
            purpose of assisting you with your inquiry or registration.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-tattvam-purple-900">5. Consent</h2>
          <p className="mt-2 text-tattvam-purple-700">
            By submitting your information through our forms or advertisements, you consent to the
            collection and use of your data as described in this policy.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-tattvam-purple-900">6. Your Rights</h2>
          <p className="mt-2 text-tattvam-purple-700">You have the right to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-tattvam-purple-700">
            <li>Request access to the information we hold about you</li>
            <li>Request correction or deletion of your data</li>
          </ul>
          <p className="mt-3 text-tattvam-purple-700">
            To do so, you may contact us using the details below.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-tattvam-purple-900">7. Contact Us</h2>
          <p className="mt-2 text-tattvam-purple-700">
            If you have any questions about this Privacy Policy or how your data is handled, please
            contact:
          </p>
          <div className="mt-3 rounded-2xl bg-tattvam-purple-50 p-6">
            <p className="font-semibold text-tattvam-purple-800">HemaTheHealer</p>
            <p className="mt-1 text-tattvam-purple-600">
              Email:{" "}
              <a
                href="mailto:hemathehealer@gmail.com"
                className="underline hover:text-tattvam-purple-800"
              >
                hemathehealer@gmail.com
              </a>
            </p>
            <p className="mt-1 text-tattvam-purple-600">
              Phone:{" "}
              <a href="tel:+916363606088" className="underline hover:text-tattvam-purple-800">
                +91 6363606088
              </a>
            </p>
          </div>
        </section>

        <p className="mt-8 text-sm text-tattvam-purple-500">
          This policy may be updated from time to time to reflect changes in our practices.
        </p>
      </div>
    </PageShell>
  );
}
