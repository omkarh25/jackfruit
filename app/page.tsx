import Link from "next/link";
import { PageShell } from "@/components/app-shell/page-shell";
import { ContentCard } from "@/components/cards/content-card";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { courses } from "@/lib/data";

const sections = [
  { href: "/feeds", title: "Feeds", description: "Announcements, resources, and personalized nudges." },
  { href: "/services", title: "Services", description: "Wellness consultations and guided packages." },
  { href: "/workshops", title: "Workshops", description: "Live Zoom events and previous recordings." },
  { href: "/courses", title: "Courses", description: "Pre-recorded learning journeys and progress." },
  { href: "/booking", title: "1:1 Booking", description: "Available consultation slots with payment flow." }
] as const;

export default function HomePage() {
  return (
    <PageShell
      eyebrow="Tatvam Niramaya"
      title="Heal, breathe, and learn with a guided holistic wellness ecosystem"
      description="A calm digital home for breathwork, Ayurveda-inspired routines, live workshops, video courses, personal consultations, and long-term wellbeing support."
    >
      <section className="grid gap-8 rounded-[2rem] bg-gradient-to-br from-jackfruit-deep via-jackfruit-leaf to-emerald-700 p-8 text-white shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-jackfruit-gold">Breathe • Balance • Become</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">Transform daily wellness into a simple practice.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
            Learn practical breathwork, mindful routines, and self-care frameworks through guided video courses, workshops, and 1:1 support.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <GoogleLoginButton />
            <Link href="/courses" className="rounded-full bg-jackfruit-gold px-6 py-3 text-sm font-bold text-jackfruit-deep shadow-soft">
              Explore courses
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-jackfruit-gold">What you get</p>
          <div className="mt-6 grid gap-4">
            {["Structured video courses", "Live workshops and recordings", "1:1 consultation booking", "Google login and learner profile"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/15 p-4 font-semibold">
                ✦ {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <ContentCard title="Breath-led healing" description="Gentle practices to regulate stress, improve sleep, and reconnect with your body." badge="Practice" />
        <ContentCard title="Personal guidance" description="Book focused 1:1 consultations for lifestyle, breathwork, and wellness planning." badge="Support" />
        <ContentCard title="Self-paced learning" description="Buy courses once and revisit lessons from your learner account whenever needed." badge="Courses" />
      </section>

      <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-jackfruit-leaf">Featured courses</p>
            <h2 className="mt-3 text-3xl font-bold text-jackfruit-deep">Start with guided video learning</h2>
          </div>
          <Link href="/courses" className="font-bold text-jackfruit-leaf hover:text-jackfruit-deep">
            View all courses →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`} className={`rounded-3xl bg-gradient-to-br ${course.imageGradient} p-6 text-jackfruit-deep transition hover:-translate-y-1 hover:shadow-soft`}>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">{course.price}</span>
              <h3 className="mt-8 text-2xl font-bold">{course.title}</h3>
              <p className="mt-3 text-jackfruit-deep/75">{course.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <ContentCard key={section.href} title={section.title} description={section.description}>
            <Link className="font-semibold text-jackfruit-leaf hover:text-jackfruit-deep" href={section.href}>
              Open section →
            </Link>
          </ContentCard>
        ))}
      </section>
    </PageShell>
  );
}