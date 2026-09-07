import type { MetadataRoute } from "next";

/**
 * robots.txt — Next.js serves this at /robots.txt.
 *
 * Exposes the sitemap and allows all major crawlers (Google, Bing) plus the
 * emerging AI crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot, etc.) so the
 * site is discoverable by AI assistants as well as traditional search.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow everything except /admin and /profile.
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/profile", "/api/*"],
      },
      // Explicit allow for AI / LLM crawlers (better AI visibility).
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      // Major search crawlers — explicitly listed so future policy tweaks can
      // be applied here without surprises.
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin", "/profile", "/api/*"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/admin", "/profile", "/api/*"] },
    ],
    sitemap: "https://tattvamniramaya.com/sitemap.xml",
    host: "https://tattvamniramaya.com",
  };
}
