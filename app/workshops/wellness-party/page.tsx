"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FloatingOrbs, Reveal } from "@/components/animations";
import { Navigation } from "@/components/app-shell/navigation";
import { WorkshopPayButton } from "@/components/payments/workshop-pay-button";
import { getWorkshopBySlug, type WorkshopRecord } from "@/lib/db/workshops";

export default function WellnessPartyPage() {
  const [workshop, setWorkshop] = useState<WorkshopRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getWorkshopBySlug("wellness-party")
      .then((data) => {
        if (data) {
          setWorkshop(data);
        }
      })
      .catch((err) => {
        console.error("Error loading Wellness Party workshop details:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Default values if not in Firestore yet
  const title = workshop?.title || "The Wellness Party";
  const date = workshop?.date || "TBD (Check Admin Panel)";
  const format = workshop?.format || "Offline";
  const price = workshop?.price || 777;
  const redirectUrl = workshop?.paymentRedirectUrl || "https://chat.whatsapp.com/mock-wellness-group";
  const whatsappLink = workshop?.whatsappLink || "https://wa.me/916363606088";
  const venueLink = workshop?.venueLink || "";
  const enquiryMode = workshop?.enquiryMode || false;

  return (
    <div className="relative overflow-x-hidden bg-tattvam-neutral-50 min-h-screen pb-20">
      <Navigation />

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center px-6 pt-28 pb-16">
        <FloatingOrbs count={5} />
        <div className="absolute left-1/10 top-1/4 h-72 w-72 rounded-full bg-tattvam-gold-200/20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/5 right-1/10 h-96 w-96 rounded-full bg-tattvam-purple-200/20 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal delay={100}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-tattvam-purple-50 px-5 py-2 text-sm font-semibold tracking-wider text-tattvam-purple-700 uppercase">
              🌿 Elevated Evening Experience
            </div>
          </Reveal>

          <Reveal delay={300}>
            <h1 className="font-serif text-5xl font-black leading-tight tracking-tight text-tattvam-purple-900 md:text-7xl">
              The Wellness Party
            </h1>
            <p className="mt-4 font-serif text-2xl font-semibold italic text-tattvam-gold-600">
              An Evening of Movement, Music, Healing & Connection
            </p>
          </Reveal>

          <Reveal delay={500}>
            <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-tattvam-purple-950/80 font-medium">
              Most parties leave you exhausted. <span className="text-tattvam-gold-600 font-bold">This one leaves you glowing.</span>
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-tattvam-purple-650/80">
              Welcome to The Wellness Party—an elevated evening designed for those who want to feel vibrant, connected, and alive without sacrificing their well-being.
              Imagine stepping into a beautiful space filled with uplifting energy, like-minded people, soothing sounds, nourishing food, and experiences that help you reconnect with yourself while having an unforgettable time.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-tattvam-purple-600 font-semibold uppercase tracking-wider">
              No pressure. No pretence. No hangover.
            </p>
          </Reveal>

          <Reveal delay={700}>
            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl bg-white p-6 shadow-soft border border-tattvam-purple-100/50">
              <div className="text-center p-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-tattvam-purple-400">Date & Time</p>
                <p className="mt-1 font-bold text-tattvam-purple-800 text-sm">{date}</p>
              </div>
              <div className="hidden sm:block h-10 w-px bg-tattvam-purple-100 self-center" />
              <div className="text-center p-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-tattvam-purple-400">Format</p>
                <p className="mt-1 font-bold text-tattvam-purple-800 text-sm">{format}</p>
              </div>
              <div className="hidden lg:block h-10 w-px bg-tattvam-purple-100 self-center" />
              <div className="text-center p-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-tattvam-purple-400">Exchange</p>
                <p className="mt-1 font-bold text-tattvam-gold-600 text-sm">{enquiryMode ? "Enquiry Mode" : `₹${price}`}</p>
              </div>
              {venueLink && (
                <>
                  <div className="hidden sm:block h-10 w-px bg-tattvam-purple-100 self-center" />
                  <div className="text-center p-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-tattvam-purple-400">Location</p>
                    <a
                      href={venueLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block font-bold text-tattvam-purple-700 underline text-sm hover:text-tattvam-purple-500 transition"
                    >
                      View Map 📍
                    </a>
                  </div>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={900}>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {enquiryMode ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex text-base font-semibold px-8 py-3.5"
                >
                  Reserve via WhatsApp
                </a>
              ) : (
                <>
                  <div className="w-full sm:w-auto">
                    <WorkshopPayButton
                      workshopId={workshop?.id || "wellness-party"}
                      workshopTitle={title}
                      price={price}
                      redirectUrl={redirectUrl}
                      buttonText="Reserve My Seat"
                    />
                  </div>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex text-base font-semibold px-8 py-3.5"
                  >
                    Enquire on WhatsApp
                  </a>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Alternating Experience Sections */}
      <section className="section-padding py-20 bg-white border-y border-tattvam-purple-100/50">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <h2 className="text-center font-serif text-4xl font-bold text-tattvam-purple-900 mb-16">
              What <span className="gradient-text">Awaits You</span>
            </h2>
          </Reveal>

          <div className="space-y-24">
            {/* 1. Glow Yoga Experience (Image on Right, Text on Left) */}
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <Reveal delay={100} className="order-2 md:order-1">
                <div className="space-y-4">
                  <div className="text-tattvam-gold-500 text-3xl font-bold font-serif">01</div>
                  <h3 className="font-serif text-3xl font-bold text-tattvam-purple-900">Glow Yoga Experience</h3>
                  <p className="text-tattvam-purple-950/80 leading-relaxed font-medium">
                    Learn simple yet powerful yoga practices that support flexibility, vitality, natural glow, and healthy weight management. Let the ambient neon light and soft environment soothe your senses.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={300} className="order-1 md:order-2">
                <div className="overflow-hidden rounded-[2rem] shadow-soft aspect-[4/3] relative">
                  <Image
                    src="/images/workshops/glow_yoga.png"
                    alt="Glow Yoga Experience"
                    fill
                    className="object-cover hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </Reveal>
            </div>

            {/* 2. Immersive Sound Healing (Image on Left, Text on Right) */}
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <Reveal delay={300} className="order-1">
                <div className="overflow-hidden rounded-[2rem] shadow-soft aspect-[4/3] relative">
                  <Image
                    src="/images/workshops/sound_healing.png"
                    alt="Immersive Sound Healing"
                    fill
                    className="object-cover hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </Reveal>
              <Reveal delay={100} className="order-2">
                <div className="space-y-4">
                  <div className="text-tattvam-gold-500 text-3xl font-bold font-serif">02</div>
                  <h3 className="font-serif text-3xl font-bold text-tattvam-purple-900">Immersive Sound Healing</h3>
                  <p className="text-tattvam-purple-950/80 leading-relaxed font-medium">
                    Let calming vibrations from pure crystal singing bowls help release stress, quiet the busy mind, and create a state of deep, restorative relaxation.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* 3. Soul Dance (Image on Right, Text on Left) */}
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <Reveal delay={100} className="order-2 md:order-1">
                <div className="space-y-4">
                  <div className="text-tattvam-gold-500 text-3xl font-bold font-serif">03</div>
                  <h3 className="font-serif text-3xl font-bold text-tattvam-purple-900">Soul Dance</h3>
                  <p className="text-tattvam-purple-950/80 leading-relaxed font-medium">
                    Move freely. Express yourself. No choreography. No judgment. Just music, shared joy, and the freedom to be yourself in a warm, welcoming environment.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={300} className="order-1 md:order-2">
                <div className="overflow-hidden rounded-[2rem] shadow-soft aspect-[4/3] relative">
                  <Image
                    src="/images/workshops/soul_dance.png"
                    alt="Soul Dance"
                    fill
                    className="object-cover hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </Reveal>
            </div>

            {/* 4. Wellness Secrets for Everyday Life (Image on Left, Text on Right) */}
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <Reveal delay={300} className="order-1">
                <div className="overflow-hidden rounded-[2rem] shadow-soft aspect-[4/3] relative">
                  <Image
                    src="/images/workshops/wellness_secrets.png"
                    alt="Wellness Secrets"
                    fill
                    className="object-cover hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </Reveal>
              <Reveal delay={100} className="order-2">
                <div className="space-y-4">
                  <div className="text-tattvam-gold-500 text-3xl font-bold font-serif">04</div>
                  <h3 className="font-serif text-3xl font-bold text-tattvam-purple-900">Wellness Secrets</h3>
                  <p className="text-tattvam-purple-950/80 leading-relaxed font-medium">
                    Discover practical wellness insights that you can immediately apply to feel more energized, balanced, and resilient in your day-to-day life.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* 5. Nourishing Gourmet Dinner (Image on Right, Text on Left) */}
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <Reveal delay={100} className="order-2 md:order-1">
                <div className="space-y-4">
                  <div className="text-tattvam-gold-500 text-3xl font-bold font-serif">05</div>
                  <h3 className="font-serif text-3xl font-bold text-tattvam-purple-900">Nourishing Gourmet Dinner</h3>
                  <p className="text-tattvam-purple-950/80 leading-relaxed font-medium">
                    Enjoy a thoughtfully curated, healthy dinner that proves wellness can be delicious, satisfying, and indulgent all at once.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={300} className="order-1 md:order-2">
                <div className="overflow-hidden rounded-[2rem] shadow-soft aspect-[4/3] relative">
                  <Image
                    src="/images/workshops/gourmet_dinner.png"
                    alt="Nourishing Gourmet Dinner"
                    fill
                    className="object-cover hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </Reveal>
            </div>

            {/* 6. Meaningful Connections (Image on Left, Text on Right) */}
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <Reveal delay={300} className="order-1">
                <div className="overflow-hidden rounded-[2rem] shadow-soft aspect-[4/3] relative">
                  <Image
                    src="/images/workshops/meaningful_connections.png"
                    alt="Meaningful Connections"
                    fill
                    className="object-cover hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </Reveal>
              <Reveal delay={100} className="order-2">
                <div className="space-y-4">
                  <div className="text-tattvam-gold-500 text-3xl font-bold font-serif">06</div>
                  <h3 className="font-serif text-3xl font-bold text-tattvam-purple-900">Meaningful Connections</h3>
                  <p className="text-tattvam-purple-950/80 leading-relaxed font-medium">
                    Meet inspiring, like-minded individuals who value personal growth, health, happiness, and conscious living.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience & Outcomes */}
      <section className="section-padding py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 md:grid-cols-2">
            {/* Who is it for */}
            <Reveal delay={200}>
              <div className="glass-card rounded-[2rem] p-8 md:p-10 border border-tattvam-purple-100/50 bg-white shadow-soft">
                <h3 className="font-serif text-2xl font-bold text-tattvam-purple-900 mb-6 border-b border-tattvam-purple-100 pb-3">
                  This Evening Is For You If…
                </h3>
                <ul className="space-y-4">
                  {[
                    "You are tired of the same old social gatherings and loud clubs.",
                    "You want to meet positive, growth-oriented people in a warm setting.",
                    "You enjoy wellness but don’t want something overly serious or boring.",
                    "You want to relax, recharge, and have fun in a meaningful way.",
                    "You believe taking care of yourself should feel joyful, not like a task."
                  ].map((check) => (
                    <li key={check} className="flex items-start gap-3">
                      <span className="text-tattvam-gold-500 font-bold text-lg mt-0.5">✓</span>
                      <span className="text-sm text-tattvam-purple-950/80 font-medium leading-relaxed">{check}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* What you'll leave with */}
            <Reveal delay={400}>
              <div className="glass-card rounded-[2rem] p-8 md:p-10 border border-tattvam-purple-100/50 bg-white shadow-soft">
                <h3 className="font-serif text-2xl font-bold text-tattvam-purple-900 mb-6 border-b border-tattvam-purple-100 pb-3">
                  What You’ll Leave With
                </h3>
                <ul className="space-y-4">
                  {[
                    "A lighter body and a calmer mind.",
                    "Inspiring, authentic new connections.",
                    "Fresh inspiration for healthy living.",
                    "Practical wellness tools for everyday balance.",
                    "A feeling that says... 'I should do this more often.'"
                  ].map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3">
                      <span className="text-tattvam-gold-500 font-bold text-lg mt-0.5">→</span>
                      <span className="text-sm text-tattvam-purple-950/80 font-medium leading-relaxed">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section-padding bg-tattvam-purple-900 py-20 text-white relative overflow-hidden">
        <FloatingOrbs count={3} />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">
              Limited <span className="text-tattvam-gold-400">Seats Available</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-purple-100/80">
              To maintain an intimate and premium experience, seats are limited. Reserve your place and join us for an evening where wellness feels like a celebration. Because feeling good deserves a party.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {enquiryMode ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex text-base font-semibold px-8 py-3.5 bg-tattvam-gold-400 text-tattvam-purple-950 hover:bg-tattvam-gold-500"
                >
                  Reserve via WhatsApp
                </a>
              ) : (
                <>
                  <div className="w-full sm:w-auto">
                    <WorkshopPayButton
                      workshopId={workshop?.id || "wellness-party"}
                      workshopTitle={title}
                      price={price}
                      redirectUrl={redirectUrl}
                      buttonText="Reserve My Seat"
                    />
                  </div>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex text-base font-semibold px-8 py-3.5 border-white text-white hover:bg-white/10"
                  >
                    WhatsApp Enquiry
                  </a>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
