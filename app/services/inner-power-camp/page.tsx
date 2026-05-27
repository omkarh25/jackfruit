"use client";

import Image from "next/image";
import { FloatingOrbs, Reveal } from "@/components/animations";
import { Navigation } from "@/components/app-shell/navigation";

const WHATSAPP_LINK = "https://wa.me/916363606088";

const campFeatures = [
  {
    icon: "/assets/inner-power-camp/img3.png",
    title: "Confidence in self-expression",
  },
  {
    icon: "/assets/inner-power-camp/img4.png",
    title: "Emotional strength & awareness",
  },
  {
    icon: "/assets/inner-power-camp/img5.png",
    title: "Focus & calmness",
  },
  {
    icon: "/assets/inner-power-camp/img6.png",
    title: "Inner stability & resilience",
  },
];

const experiences = [
  {
    title: "Warrior Movement (Kalaripayattu)",
    description: "Builds strength, discipline, body awareness",
    image: "/assets/inner-power-camp/img7.jpg",
  },
  {
    title: "Mindful Yoga & Breathwork",
    description: "Improves focus and emotional balance",
    image: "/assets/inner-power-camp/img8.jpg",
  },
  {
    title: "Emotional Expression Theatre",
    description: "Helps children express through storytelling",
    image: "/assets/inner-power-camp/img9.jpg",
  },
  {
    title: "Sound Healing Experience",
    description: "Calms mind and restores balance",
    image: "/assets/inner-power-camp/img10.jpg",
  },
  {
    title: "Confidence & Decision Lab",
    description: "Builds decision-making and self-trust",
    image: "/assets/inner-power-camp/img11.jpg",
  },
  {
    title: "Sensory Art Expression",
    description: "Encourages emotional release through creativity",
    image: "/assets/inner-power-camp/img12.jpg",
  },
];

export default function InnerPowerCampPage() {
  return (
    <div className="relative overflow-x-hidden bg-tattvam-neutral-50">
      <Navigation />

      {/* Section 1: Hero */}
      <section className="relative flex min-h-[90vh] items-center px-6 pt-20">
        <FloatingOrbs count={5} />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-tattvam-gold-200/30 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-tattvam-purple-200/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="mx-auto max-w-3xl text-center md:text-left md:mx-0">
              <Reveal delay={100}>
                <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-tattvam-purple-900 md:text-7xl">
                  Inner Power <span className="gradient-text">Camp</span> for Kids
                </h1>
              </Reveal>

              <Reveal delay={300}>
                <h2 className="mt-6 font-serif text-2xl font-medium text-tattvam-purple-700 md:text-3xl">
                  Not just a summer camp — a foundation for life
                </h2>
              </Reveal>

              <Reveal delay={500}>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
                  A holistic experience designed to build confidence, emotional strength, and focus in children—through movement, mindfulness, creativity, and expression.
                </p>
              </Reveal>

              <Reveal delay={700}>
                <div className="mt-8 max-w-xl rounded-2xl bg-gradient-to-r from-tattvam-gold-400/10 to-tattvam-purple-400/10 p-6">
                  <p className="font-serif text-lg text-tattvam-purple-800">
                    This is not about keeping children busy.
                  </p>
                  <p className="mt-1 font-serif text-lg font-semibold text-tattvam-gold-600">
                    This is about shaping who they become.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={900}>
                <div className="mt-10">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex"
                  >
                    Enquire Now
                    <span className="ml-2">→</span>
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal direction="right" delay={300}>
              <div className="relative hidden lg:block">
                <div className="glass-card aspect-[4/3] overflow-hidden rounded-[2rem]">
                  <Image
                    src="/assets/inner-power-camp/img1.jpg"
                    alt="Inner Power Camp for Kids"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] border-2 border-tattvam-gold-300/30" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section 2: About */}
      <section className="section-padding bg-gradient-to-b from-white to-tattvam-purple-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <Reveal direction="left">
              <div>
                <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                  About The Camp
                </span>
                <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                  About <span className="gradient-text">Inner Power Camp</span>
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-tattvam-purple-600/80">
                  At Tattvam Niramaya, we believe childhood is where confidence, emotional strength, and focus are built.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-tattvam-purple-600/80">
                  This camp helps children connect with their inner world—while growing stronger in the outer world.
                </p>
              </div>
            </Reveal>

            <Reveal direction="right" delay={200}>
              <div className="relative">
                <div className="glass-card aspect-[4/3] overflow-hidden rounded-[2rem]">
                  <Image
                    src="/assets/inner-power-camp/img2.jpg"
                    alt="About Inner Power Camp"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] border-2 border-tattvam-gold-300/30" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section 3: What This Camp Builds */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-100 px-4 py-2 text-sm font-medium text-tattvam-gold-700">
                Core Benefits
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                What This Camp <span className="text-tattvam-gold-500">Builds</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {campFeatures.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 100}>
                <div className="card-hover rounded-3xl bg-white p-8 text-center shadow-soft">
                  <div className="relative mx-auto mb-4 h-16 w-16">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-tattvam-purple-800">
                    {feature.title}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Experience Grid */}
      <section className="section-padding bg-gradient-to-b from-tattvam-purple-50 to-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                Activities
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                The <span className="gradient-text">Experience</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp, i) => (
              <Reveal key={exp.title} delay={i * 100}>
                <div className="card-hover overflow-hidden rounded-3xl bg-white shadow-soft">
                  <div className="relative aspect-square">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold text-tattvam-purple-800">
                      {exp.title}
                    </h3>
                    <p className="mt-2 text-sm text-tattvam-purple-600/70">
                      {exp.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Outcomes */}
      <section className="section-padding bg-tattvam-purple-900">
        <FloatingOrbs count={3} />
        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-400/20 px-4 py-2 text-sm font-medium text-tattvam-gold-300">
                Results
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
                What Your Child Will <span className="text-tattvam-gold-400">Walk Away With</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                "Express themselves with confidence",
                "Handle emotions better",
                "Stronger focus and calmer mind",
                "Feel grounded and inwardly strong",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl bg-tattvam-purple-800/50 p-5 glass-card-dark"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tattvam-gold-400/20">
                    <span className="text-tattvam-gold-400">✓</span>
                  </div>
                  <span className="text-purple-100/90">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 6: Who Is This For */}
      <section className="section-padding">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                Ideal For
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                Who Is This <span className="gradient-text">For?</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 rounded-3xl bg-white p-8 shadow-soft">
              <ul className="space-y-4">
                {[
                  "Struggle with confidence or expression",
                  "Easily distracted or anxious",
                  "Need emotional grounding",
                  "Want deeper growth beyond academics",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tattvam-gold-100">
                      <span className="text-tattvam-gold-600">✦</span>
                    </div>
                    <span className="text-lg text-tattvam-purple-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 7: Why This Camp Is Different */}
      <section className="section-padding bg-gradient-to-b from-tattvam-purple-50 to-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <Reveal direction="left">
              <div>
                <span className="inline-block rounded-full bg-tattvam-gold-100 px-4 py-2 text-sm font-medium text-tattvam-gold-700">
                  The Difference
                </span>
                <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                  Why This Camp Is <span className="gradient-text">Different</span>
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-tattvam-purple-600/80">
                  This is not about keeping children busy.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-tattvam-purple-700">
                  It&apos;s about helping them discover who they are.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-tattvam-purple-600/80">
                  Every activity is designed with purpose—blending ancient wisdom, modern psychology, and experiential learning.
                </p>
              </div>
            </Reveal>

            <Reveal direction="right" delay={200}>
              <div className="relative">
                <div className="glass-card aspect-[4/3] overflow-hidden rounded-[2rem]">
                  <Image
                    src="/assets/inner-power-camp/img13.jpg"
                    alt="Why This Camp Is Different"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] border-2 border-tattvam-purple-300/30" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section 8: Final CTA */}
      <section className="section-padding bg-tattvam-purple-900">
        <FloatingOrbs count={4} />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">
              Give your child something that <span className="text-tattvam-gold-400">stays for life</span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-purple-100/80">
              Not just skills. Not just activities.
            </p>
            <p className="mx-auto mt-2 text-xl font-semibold text-tattvam-gold-400">
              A stronger, more aware human being.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex"
              >
                Enquire Now
                <span className="ml-2">→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-tattvam-purple-100 bg-tattvam-purple-50 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-tattvam-purple-500">
            © 2026 Tattvam Niramaya. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
