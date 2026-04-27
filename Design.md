# Repo and Stack Design for Tatvam Niramaya Jackfruit Platform

## Overview

This document proposes a practical tech stack and repository structure for the Tatvam Niramaya ecosystem: the public website, the Jackfruit learning app, and the admin panel.
It emphasizes low or zero fixed cost in the early phase, smooth support for Google and (optionally) SMS login, Razorpay payments, and a workflow suited for course hosting, workshops, and CRM.

## Requirements Recap

Key functional pieces across the three subdomains:

- **tatvamniramaya.com**: marketing site, static content, blog, SEO.
- **learn.tatvamniramaya.com (Jackfruit app)**:
  - Auth: passwordless login with Google and optional SMS/OTP.
  - Tabs: Feeds, Services, Workshops (live + past recordings), Courses (pre‑recorded), 1:1 booking, payments with Razorpay.
- **admin.tatvamniramaya.com**:
  - Notifications (email + SMS campaigns and transactional messages).
  - Reporting and analytics (usage, revenue, cohorts, course performance).
  - Lightweight CRM (clients, notes, tags, follow‑ups).

Non‑functional goals:

- Free or very cheap to run initially; predictable cost path as usage grows.
- Single codebase that is easy to evolve and onboard other devs onto.
- Good DX with TypeScript, component reuse, and clear separation of concerns.

## Recommended High-Level Architecture

The recommended design is a **TypeScript monorepo** using **Next.js 14 App Router** for all three web frontends, a shared PostgreSQL database (Neon/Supabase/Railway), and a shared auth layer (Clerk or Firebase Auth) depending on SMS requirements.
Next.js is well suited for multi‑app monorepos, supports server components and server actions, integrates well with auth providers, and deploys cleanly to Vercel.

### Why Next.js Monorepo

- One language (TypeScript) end‑to‑end, reducing cognitive load.
- First‑class support for SSR/ISR for SEO on the marketing site.
- Easy subdomain routing via separate apps in a Turborepo or single monorepo.
- Mature ecosystem for auth, payments (Razorpay SDK, webhooks), and file storage.

### Suggested Hosting

- **Frontend + edge/serverless**: Vercel (free tier is sufficient to start for low traffic).
- **Database**: managed Postgres (e.g., Neon, Supabase, Railway, Render) free tier.
- **Static assets / recordings**: object storage (Supabase Storage / Cloudflare R2 / S3) with CDN.

## Auth Options with Free-Tier Focus

There are two realistic options for Google + optional SMS auth with minimal fixed cost early on.
It is important to note that **no mainstream provider offers unlimited free production SMS OTP**; SMS almost always has a per‑message cost because providers have to pay telecom carriers.

### Option A: Clerk with Google and SMS

Clerk is a modern auth provider with a generous free tier and tight integration with Next.js.

- Clerk’s free tier currently includes up to **50,000 monthly retained users per application** without a base subscription.[1][2]
- It supports Google OAuth and other social providers in the free tier.
- SMS codes are supported; the pricing page shows SMS as **$0.01 per SMS in the US and Canada, with international SMS billed at market rates**.[1]

Implications:

- You can have **zero monthly auth subscription cost** while you are small, and pay only per SMS actually sent.
- For the initial phase, recommend emphasizing **Google login and email magic links** as primary flows (free), and offering SMS login only to high‑intent users to keep SMS volume and cost low.

### Option B: Firebase Authentication (Google + SMS)

Firebase Auth provides a very generous free tier for email/password and social logins, including Google.[3]

- Free tier: up to **50,000 monthly active users (MAUs)** for standard auth providers (email/password, Google, Apple, Facebook, etc.).[3]
- **Phone (SMS) auth is not free in production**; it is billed per SMS verification, around **$0.01 per SMS in India**, which is relatively low cost.[3]
- Firebase provides 10 free SMS per day, but **only for testing with test phone numbers**, not for production usage.[3]

Implications:

- You can run **Google‑only login completely free** in the early phase.
- If you add SMS login, cost is still predictable and low at small scale in India.

### Option C: Supabase Auth with Twilio (generally not free SMS)

Supabase Auth can be paired with Twilio for SMS OTP login.
Their official guide demonstrates configuring Twilio (account SID, auth token, sender number) and enabling phone login in Supabase Auth settings.[4]
In this setup, SMS cost is driven by Twilio’s per‑SMS pricing, which can be relatively expensive in some countries.[5]

This is powerful and flexible (you can self‑host Supabase and plug in a cheaper local SMS gateway), but it is usually **not zero‑cost** in production and introduces extra moving parts.

### Recommendation for Auth

For a Next.js‑centric stack with an Indian audience and a need for a strong free tier:

- Use **Clerk** if you want the best DX and ready‑made UI, and you are okay paying per SMS when you enable phone login.
- Use **Firebase Auth** if you prefer Google’s ecosystem, are comfortable wiring your own UI, and want to keep auth fully free for Google‑only login.

In both cases, start production with **Google sign‑in (and email magic links) as the primary login**, and add SMS later when you have validated demand.

## Proposed Repo Structure

Use a Turborepo‑style monorepo with pnpm or yarn workspaces:

```text
jackfruit-monorepo/
  apps/
    web/           # tatvamniramaya.com (marketing)
    jackfruit/     # learn.tatvamniramaya.com (learner app)
    admin/         # admin.tatvamniramaya.com (admin panel)
  packages/
    ui/            # shared React UI components (shadcn/ui, design system)
    config/        # ESLint, TSConfig, Tailwind configs
    db/            # Prisma schema + migrations, DB client
    auth/          # auth helpers, middleware, server-side session utils
    core/          # shared domain logic (booking, billing, notifications)
  infra/
    docker/        # optional Dockerfiles if you later move off Vercel
    scripts/       # CI, data migrations, seeding
```

### apps/web (Marketing Site)

- Next.js App Router using static generation and incremental static regeneration.
- Content via MDX or a simple headless CMS (e.g., Contentlayer, or hosted CMS later).
- Basic lead capture (newsletter form) posting into the same database or a separate email tool.

### apps/jackfruit (Learner App)

Main end‑user app for clients consuming content and services.

Key modules:

- **Auth shell**: Layout that checks session, redirects to login page if unauthenticated.
- **Feeds**: Personalized updates (new workshops, course recommendations, announcements).
- **Services**: List of 1:1 offerings and packages; links into booking flow.
- **Workshops**:
  - Upcoming workshops with Zoom links and timings.
  - Past workshops with access to video recordings (stored in S3/R2/Supabase Storage) and resource links.
- **Courses**:
  - Course catalog and “My courses” dashboard.
  - Course detail → sections → lessons with video + downloadable PDFs.
- **1:1 Booking**:
  - Calendar UI showing author’s available slots (read from DB).
  - Booking flow including Razorpay payment and confirmation screens.

### apps/admin (Admin Panel)

Internal tool for the author/team.

Key modules:

- **Dashboard**: revenue charts, active users, course completion stats.
- **Courses & workshops**: CRUD for courses, modules, lessons, workshop sessions.
- **Recordings**: upload and attach recordings to workshops and courses.
- **Booking & calendar**: define available time slots, view bookings, mark no‑shows.
- **Notifications**:
  - Create and schedule campaigns (email/SMS) to segments of users.
  - Trigger transactional notifications (booking confirmations, payment receipts).
- **CRM**:
  - Client profiles with tags, notes, last interaction, and history of purchases.

## Backend and Data Design

### Database

A single Postgres database (managed) with a clear schema, for example:

- `users` (id, auth_provider_id, email, phone, name, role).
- `profiles` (user_id FK, additional metadata like city, interests).
- `courses`, `modules`, `lessons`.
- `workshops` (live sessions), `workshop_recordings`.
- `enrollments` (user ↔ course), `workshop_registrations`.
- `products` and `prices` (map offerings to Razorpay products/pricing if desired).
- `orders` / `payments` (user, item type, amount, Razorpay payment_id, status).
- `time_slots` (author availability), `bookings` (client reservations).
- `notifications` (templates, type, channel), `notification_logs`.
- `crm_contacts` (if separate from users), `crm_notes`, `crm_tags`, `crm_contact_tags`.

Use Prisma as the ORM in a shared `packages/db` package to keep types in sync across apps.

### Payments (Razorpay)

- Frontend (jackfruit app) uses Razorpay Checkout (JS SDK) for payments.
- Backend API route or server action verifies Razorpay signatures, records payment, and activates course/enrollment or booking.
- Admin app can view and reconcile payments, refunds, and failed payments.

## Notifications Layer

Start simple with a “notification service” in `packages/core` that exposes functions like:

- `sendTransactionalEmail(type, user, context)`
- `sendTransactionalSms(type, user, context)`
- `scheduleCampaign(channel, segment, template, sendAt)`

Implementation in early phase:

- Email via a service like Postmark or Resend (both have generous free tiers for low volumes).
- SMS via the same provider used for auth (e.g., Twilio with Firebase or Supabase; or a separate Indian SMS gateway if integrated);
  costs will be per SMS.

Admin panel exposes UIs to:

- Draft, preview, and send messages.
- Filter targets (e.g., enrolled in specific course, attended workshop, inactive for N days).
- Check delivery and open rates where supported.

## CRM Layer

For the first version, build a lean CRM inside the admin app:

- Client list with search, filters, and tags.
- Timeline of activity (signups, enrollments, purchases, bookings, workshop attendance).
- Free‑text notes and next‑action reminders.

As the system matures, this can be integrated with external tools (HubSpot, Zoho CRM) via webhooks or scheduled exports.

## Why This Stack Fits the Requirements

- **Free or nearly free to start**: Next.js + Vercel + Postgres free tier + auth free tier (Google login) give a near‑zero fixed monthly cost profile.[1][3]
- **Scales gradually**: Per‑SMS costs scale with usage; higher‑level paid features (advanced MFA, SAML, etc.) are optional and only needed at higher scale.[1][3]
- **Good DX for a full‑stack developer**: TypeScript, Prisma, and a monorepo make it easy to evolve domain logic, reuse UI, and maintain consistency.
- **Separation of concerns**: Three apps map nicely to the three subdomains (marketing, learner, admin) while sharing a single codebase and shared packages.
- **Flexibility to swap providers later**: By centralizing auth and notification logic in shared packages, you can migrate from Clerk to Firebase (or vice versa), or from Twilio to a local SMS gateway, with minimal changes to app‑level code.