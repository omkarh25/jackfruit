import type { Metadata } from "next";

/**
 * Centralised per-page metadata for the public site.
 *
 * Source of truth: `webpgChanges/metadescriptions.md`.
 * Consumed by tiny `layout.tsx` files next to "use client" pages, since Next.js
 * does not allow `export const metadata` from a client component.
 */

const SITE = "https://tattvamniramaya.com";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

/**
 * Build a complete `Metadata` object for a public route. Centralised so we can
 * tweak title/OG templates once and have them apply everywhere.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: `${SITE}${input.path}`,
      type: "website",
      siteName: "Tattvam Niramaya Academy",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}

// ─── Per-page presets (refer to webpgChanges/metadescriptions.md) ───────────

export const coursesMetadata = buildPageMetadata({
  title: "Wellness & Healing Courses | Tattvam Niramaya",
  description:
    "Explore structured video courses for breath, balance and daily wellbeing, designed to help you build awareness and sustainable personal practices.",
  path: "/courses",
});

export const feedsMetadata = buildPageMetadata({
  title: "Feeds & Updates | Tattvam Niramaya",
  description:
    "Explore the latest insights, updates, practices and offerings from Tattvam Niramaya for healing, awareness, wellbeing and personal transformation.",
  path: "/feeds",
});

export const servicesMetadata = buildPageMetadata({
  title: "Healing & Wellness Services | Tattvam Niramaya",
  description:
    "Explore Tattvam Niramaya's healing and wellness services, consultations and transformative programs designed to support mind, body and emotional wellbeing.",
  path: "/services",
});

export const bookingMetadata = buildPageMetadata({
  title: "Book a 1:1 Consultation | Tattvam Niramaya",
  description:
    "Book a personal consultation with Tattvam Niramaya for intuitive guidance, healing and support tailored to your individual journey and needs.",
  path: "/booking",
});

export const profileMetadata = buildPageMetadata({
  title: "My Profile | Tattvam Niramaya",
  description:
    "Access your Tattvam Niramaya profile, purchased courses, learning content and personal wellness journey in one place.",
  path: "/profile",
  noIndex: true,
});

export const projectAnandaMetadata = buildPageMetadata({
  title: "Project Ananda | Body, Mind & Emotional Transformation",
  description:
    "Project Ananda is Tattvam Niramaya's signature transformation program, bringing body, mind and emotions into balance through movement, healing and guided growth.",
  path: "/services/project-ananda",
});

export const kalariPayattuMetadata = buildPageMetadata({
  title: "Kalari Payattu Training | Tattvam Niramaya",
  description:
    "Learn traditional Kalari Payattu to build strength, flexibility, discipline, awareness and self-defense through guided online or in-person training.",
  path: "/services/kalaripayattu",
});

export const tarotMetadata = buildPageMetadata({
  title: "Tarot Card Reading | Clarity & Guidance | Tattvam Niramaya",
  description:
    "Experience tarot as a tool for self-awareness, emotional clarity and conscious decision-making, with grounded guidance for relationships, career and life direction.",
  path: "/services/tarot-card-reading",
});

export const innerChildMetadata = buildPageMetadata({
  title: "Inner Child Healing | Tattvam Niramaya",
  description:
    "Heal emotional wounds and reconnect with your authentic self through guided inner child work with Tattvam Niramaya.",
  path: "/services/inner-child-healing",
});

export const innerPowerCampMetadata = buildPageMetadata({
  title: "Inner Power Camp for Kids | Tattvam Niramaya",
  description:
    "A holistic experience designed to build confidence, emotional strength, and focus in children—through movement, mindfulness, creativity, and expression.",
  path: "/services/inner-power-camp",
});
