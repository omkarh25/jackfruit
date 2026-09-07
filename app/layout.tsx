import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

/**
 * Default (Home) page metadata.
 *
 * Each route in the app overrides these via its own `export const metadata`
 * so search engines and AI crawlers see meaningful, page-specific descriptions.
 *
 * Source of truth: `webpgChanges/metadescriptions.md`.
 */
export const metadata: Metadata = {
  title: "Tattvam Niramaya | Holistic Healing & Transformation",
  description:
    "Tattvam Niramaya is a sanctuary for healing and transformation through intuitive healing, ancient wisdom, energy work and conscious awareness.",
  metadataBase: new URL("https://tattvamniramaya.com"),
  applicationName: "Tattvam Niramaya Academy",
  keywords: [
    "Tattvam Niramaya",
    "holistic healing",
    "transformation",
    "Kalari Payattu",
    "tarot reading",
    "Project Ananda",
    "wellness",
  ],
  authors: [{ name: "Tattvam Niramaya Academy" }],
  creator: "Tattvam Niramaya Academy",
  publisher: "Tattvam Niramaya Academy",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://tattvamniramaya.com",
    siteName: "Tattvam Niramaya Academy",
    title: "Tattvam Niramaya | Holistic Healing & Transformation",
    description:
      "Tattvam Niramaya is a sanctuary for healing and transformation through intuitive healing, ancient wisdom, energy work and conscious awareness.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tattvam Niramaya | Holistic Healing & Transformation",
    description:
      "Tattvam Niramaya is a sanctuary for healing and transformation through intuitive healing, ancient wisdom, energy work and conscious awareness.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#5B3E8C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </html>
  );
}
