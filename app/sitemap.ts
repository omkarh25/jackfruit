import type { MetadataRoute } from "next";

/**
 * Sitemap — Next.js serves this at /sitemap.xml.
 *
 * Lists every public route on the site that should be indexed. Static routes
 * are hand-curated to match the actual navigation; admin / profile / api are
 * deliberately excluded.
 */

const SITE_URL = "https://tattvamniramaya.com";

// Update these timestamps whenever the corresponding page changes meaningfully.
const lastModified = new Date();

type Route = {
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

const routes: Route[] = [
  // Top-level
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/feeds", changeFrequency: "daily", priority: 0.7 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/courses", changeFrequency: "weekly", priority: 0.8 },
  { path: "/booking", changeFrequency: "monthly", priority: 0.8 },

  // Services
  { path: "/services/project-ananda", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services/project-ananda/pricing", changeFrequency: "weekly", priority: 0.7 },
  { path: "/services/kalaripayattu", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services/kalaripayattu/pricing", changeFrequency: "weekly", priority: 0.7 },
  { path: "/services/tarot-card-reading", changeFrequency: "weekly", priority: 0.8 },
  { path: "/services/inner-child-healing", changeFrequency: "weekly", priority: 0.7 },
  { path: "/services/inner-power-camp", changeFrequency: "weekly", priority: 0.7 },

  // Legal
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-conditions", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
