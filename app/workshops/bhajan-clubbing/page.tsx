"use client";

import { useEffect, useState } from "react";
import { FloatingOrbs, Reveal } from "@/components/animations";
import { Navigation } from "@/components/app-shell/navigation";
import { WorkshopPayButton } from "@/components/payments/workshop-pay-button";
import { getWorkshopBySlug, type WorkshopRecord } from "@/lib/db/workshops";

export default function BhajanClubbingPage() {
  const [workshop, setWorkshop] = useState<WorkshopRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getWorkshopBySlug("bhajan-clubbing")
      .then((data) => {
        if (data) {
          setWorkshop(data);
        }
      })
      .catch((err) => {
        console.error("Error loading Bhajan Clubbing workshop details:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Default values if not in Firestore yet
  const title = workshop?.title || "Bhajan Clubbing";
  const date = workshop?.date || "TBD (Check Admin Panel)";
  const format = workshop?.format || "Offline";
  const price = workshop?.price || 999;
  const redirectUrl = workshop?.paymentRedirectUrl || "https://chat.whatsapp.com/mock-bhajan-group";
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
        <div className="absolute bottom-1/5 right-1/10 h-96 w-96 rounded-full bg-tattvam-purple-200/20 blur-3xl animate-float-slow" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal delay={100}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-tattvam-purple-50 px-5 py-2 text-sm font-semibold tracking-wider text-tattvam-purple-700 uppercase">
              ✨ Immersive Music Experience
            </div>
          </Reveal>

          <Reveal delay={300}>
            <h1 className="font-serif text-5xl font-black leading-tight tracking-tight text-tattvam-purple-900 md:text-7xl">
              Bhajan Clubbing
            </h1>
            <p className="mt-4 font-serif text-2xl font-semibold italic text-tattvam-gold-600">
              An Immersive Experience of Music, Movement & Bliss
            </p>
          </Reveal>

          <Reveal delay={500}>
            <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-tattvam-purple-950/80 font-medium">
              What if one evening could leave you feeling more alive, more joyful, and more connected than any night out ever could?
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-tattvam-purple-600/90 font-semibold uppercase tracking-wider">
              Get High Without the Hangover.
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
                      workshopId={workshop?.id || "bhajan-clubbing"}
                      workshopTitle={title}
                      price={price}
                      redirectUrl={redirectUrl}
                      buttonText="Reserve My Spot"
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

      {/* Intro Grid */}
      <section className="section-padding py-16 bg-white border-y border-tattvam-purple-100/50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: "No Alcohol", desc: "Pure connection, zero chemicals. Elevate your consciousness naturally.", icon: "🍹" },
              { title: "No Substances", desc: "Get high on rhythm, chanting, and collective movement.", icon: "✨" },
              { title: "No Hangover", desc: "Wake up the next morning feeling refreshed, glowing, and deeply at peace.", icon: "☀️" },
            ].map((item, idx) => (
              <Reveal key={item.title} delay={idx * 150}>
                <div className="text-center p-6 rounded-2xl bg-tattvam-purple-50/50 border border-tattvam-purple-100/30">
                  <span className="text-4xl block mb-4">{item.icon}</span>
                  <h3 className="font-serif text-xl font-bold text-tattvam-purple-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-tattvam-purple-950/70 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Experience Details */}
      <section className="section-padding py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <h2 className="text-center font-serif text-4xl font-bold text-tattvam-purple-900 mb-12">
              The <span className="gradient-text">Journey</span>
            </h2>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={200}>
              <div className="glass-card rounded-2xl p-8 border border-tattvam-purple-100/50 bg-white/70">
                <p className="text-lg leading-relaxed text-tattvam-purple-950/80 font-medium">
                  Welcome to Bhajan Clubbing—an immersive experience where music, movement, rhythm, and collective energy come together to create a natural state of joy, freedom, and bliss.
                </p>
                <p className="mt-4 text-base leading-relaxed text-tattvam-purple-600/90">
                  This is not a concert. This is not a religious gathering. This is not a meditation class.
                  This is a living, breathing experience. One where strangers become a community, music becomes movement, and joy becomes contagious.
                </p>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="rounded-2xl bg-tattvam-purple-900 p-8 text-white relative overflow-hidden shadow-medium">
                <div className="absolute right-0 top-0 opacity-10 text-9xl">🎵</div>
                <h3 className="font-serif text-2xl font-bold text-tattvam-gold-400 mb-4">7 Musical Journeys</h3>
                <p className="text-sm text-purple-100/90 leading-relaxed">
                  The evening unfolds through seven carefully curated musical journeys. Each one is designed to elevate your energy a little higher than the last.
                  We begin gently. The rhythm builds. The voices rise. The room comes alive. People start clapping, singing, moving, dancing, smiling, and laughing.
                  And before you know it, the entire space becomes one shared celebration.
                </p>
                <p className="mt-4 text-sm text-tattvam-gold-300 font-semibold">
                  As the energy reaches its peak, we guide you into a deeply restorative sound healing experience, allowing the body to relax and the mind to settle into profound stillness.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What Awaits You */}
      <section className="section-padding py-20 bg-tattvam-purple-50/50 border-y border-tattvam-purple-100/40">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <h2 className="text-center font-serif text-4xl font-bold text-tattvam-purple-900 mb-12">
              What <span className="gradient-text">Awaits You</span>
            </h2>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Welcome Wellness Drink", desc: "Arrive, unwind, and begin your evening with a refreshing, natural wellness beverage.", icon: "🍹" },
              { title: "Immersive Music Experience", desc: "Participate in an uplifting musical journey designed to energize the body, open the heart, and elevate your spirit.", icon: "🕉️" },
              { title: "Music, Movement & Collective Joy", desc: "Sing, clap, sway, dance, and immerse yourself in the warm, healing power of shared connection.", icon: "🕺" },
              { title: "Sound Healing Finale", desc: "Relax into soothing crystal sound vibrations that calm the nervous system and restore deep inner alignment.", icon: "🥣" },
              { title: "Wellness Snack Counter", desc: "Delectable, light, healthy snacks and refreshments will be available for purchase to keep you energized.", icon: "🥙" },
            ].map((item, idx) => (
              <Reveal key={item.title} delay={idx * 100}>
                <div className="h-full flex flex-col rounded-2xl bg-white p-6 shadow-soft border border-tattvam-purple-100/30 hover:border-tattvam-purple-200 transition">
                  <span className="text-3xl block mb-4">{item.icon}</span>
                  <h3 className="font-serif text-lg font-bold text-tattvam-purple-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-tattvam-purple-950/70 leading-relaxed mt-auto">{item.desc}</p>
                </div>
              </Reveal>
            ))}
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
                  This Experience Is For You If…
                </h3>
                <ul className="space-y-4">
                  {[
                    "You want a meaningful alternative to the usual nightlife scene.",
                    "You love music and enjoy being part of a vibrant collective experience.",
                    "You want to feel energized, joyful, and connected without relying on alcohol or substances.",
                    "You enjoy wellness experiences that are engaging, uplifting, and fun.",
                    "You are curious about exploring deeper states of happiness through music and movement."
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
                    "A lighter, happier heart.",
                    "A calmer, clearer mind.",
                    "A vibrant, energized body.",
                    "A renewed sense of collective connection.",
                    "A lingering feeling of joy that stays long after the music ends."
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
              To create a powerful and immersive atmosphere, seats are limited. Reserve your place and join us for an evening where music becomes meditation, movement becomes celebration, and bliss becomes an experience.
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
                  Reserve My Spot via WhatsApp
                </a>
              ) : (
                <>
                  <div className="w-full sm:w-auto">
                    <WorkshopPayButton
                      workshopId={workshop?.id || "bhajan-clubbing"}
                      workshopTitle={title}
                      price={price}
                      redirectUrl={redirectUrl}
                      buttonText="Reserve My Spot"
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
