/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FloatingOrbs,
  GSAPReveal,
  TextReveal,
  SanskritReveal,
  PulsatingAura,
  TravelingLogo,
  ParallaxImage,
  EnergyParticles,
  CursorGlow,
  AuroraBackground,
  BackgroundMusic,
} from "@/components/animations";
import { LOGGER } from "@/lib/logger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Premium landing page for Tattvam Niramaya.
 * Focuses on brand essence, vision, and mission rather than product features.
 *
 * "Tattvam Niramaya" — Sanskrit meaning:
 * - Tattvam (तत्वम्): Truth, Reality, The Essential Nature of Being
 * - Niramaya (निरामय): Freedom from Disease/Affliction, Perfect Health
 *
 * Meaning: "The Truth That Heals"
 */
export default function HomePage() {
  LOGGER.info("Rendering premium landing page");

  // ─── Refs ───
  const navRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const essenceSectionRef = useRef<HTMLElement>(null);
  const tattvamCardRef = useRef<HTMLDivElement>(null);
  const niramayaCardRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const statNumbersRef = useRef<HTMLDivElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);

  // ─── 1. Hero Load Sequence ───
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-orb",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8 }
      )
        .fromTo(
          ".hero-badge",
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          0.2
        )
        .fromTo(
          ".hero-word",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 },
          0.35
        )
        .fromTo(
          ".hero-subtitle",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          0.7
        )
        .fromTo(
          ".hero-ctas",
          { scale: 0.92, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5 },
          0.9
        )
        .fromTo(
          ".hero-founder",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          1.1
        )
        .fromTo(
          ".hero-scroll",
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          1.4
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // ─── 2. Navigation Hide/Show on Scroll ───
  useEffect(() => {
    if (!navRef.current) return;

    let lastScroll = 0;
    const handleScroll = () => {
      const current = window.scrollY;
      if (!navRef.current) return;
      if (current > lastScroll && current > 100) {
        navRef.current.classList.add("nav-hidden");
        navRef.current.classList.remove("nav-visible");
      } else {
        navRef.current.classList.remove("nav-hidden");
        navRef.current.classList.add("nav-visible");
      }
      lastScroll = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── 3. Essence 3D Card Reveal ───
  useEffect(() => {
    if (!tattvamCardRef.current || !niramayaCardRef.current) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tattvamCardRef.current,
        { x: -100, rotateY: -15, opacity: 0 },
        {
          x: 0,
          rotateY: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: essenceSectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        niramayaCardRef.current,
        { x: 100, rotateY: 15, opacity: 0 },
        {
          x: 0,
          rotateY: 0,
          opacity: 1,
          duration: 0.9,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: essenceSectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // ─── 4. Pillar Cards Stagger ───
  useEffect(() => {
    if (!pillarsRef.current) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const cards = pillarsRef.current.querySelectorAll(".pillar-card");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pillarsRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // ─── 5. Mission Stat Counter ───
  useEffect(() => {
    if (!statNumbersRef.current) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const counters = statNumbersRef.current.querySelectorAll(".stat-counter");
    const ctx = gsap.context(() => {
      counters.forEach((counter) => {
        const target = parseFloat(counter.getAttribute("data-target") || "0");
        const suffix = counter.getAttribute("data-suffix") || "";
        const isDecimal = counter.getAttribute("data-decimal") === "true";

        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statNumbersRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            const formatted = isDecimal
              ? obj.val.toFixed(1)
              : Math.round(obj.val).toString();
            counter.textContent = formatted + suffix;
          },
          onComplete: () => {
            counter.classList.add("stat-glow");
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  // ─── 6. Mission Checklist Draw ───
  useEffect(() => {
    if (!checklistRef.current) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const items = checklistRef.current.querySelectorAll(".check-item");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: checklistRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // ─── 7. Testimonials 3D Entry ───
  useEffect(() => {
    if (!testimonialsRef.current) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const cards = testimonialsRef.current.querySelectorAll(".testimonial-card");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 60, rotateX: 10, opacity: 0 },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // ─── 8. Community Card Scale ───
  useEffect(() => {
    if (!communityRef.current) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        communityRef.current,
        { scale: 0.92, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: communityRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative overflow-x-hidden bg-tattvam-neutral-50">
      <EnergyParticles />
      <CursorGlow />
      <TravelingLogo />
      <BackgroundMusic />

      {/* Navigation */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 glass-card transition-transform duration-300 nav-visible"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <div className="relative h-20 w-60">
              <Image
                src="/assets/homepage/logo.png"
                alt="Tattvam Niramaya Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="#essence"
              className="hidden text-sm font-medium text-tattvam-purple-600 transition hover:text-tattvam-purple-800 md:block"
            >
              Our Essence
            </Link>
            <Link
              href="#mission"
              className="hidden text-sm font-medium text-tattvam-purple-600 transition hover:text-tattvam-purple-800 md:block"
            >
              Mission
            </Link>
            <Link
              href="#founder"
              className="hidden text-sm font-medium text-tattvam-purple-600 transition hover:text-tattvam-purple-800 md:block"
            >
              Founder
            </Link>
            <Link
              href="#testimonials"
              className="hidden text-sm font-medium text-tattvam-purple-600 transition hover:text-tattvam-purple-800 md:block"
            >
              Stories
            </Link>
            <Link href="/booking" className="btn-primary text-sm">
              Book Discovery Call
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center section-padding">
        <AuroraBackground variant="light" />
        <div className="hero-orb">
          <FloatingOrbs count={6} />
        </div>

        {/* Decorative elements */}
        <div className="hero-orb absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-tattvam-gold-200/30 blur-3xl animate-float-slow" />
        <div
          className="hero-orb absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-tattvam-purple-200/30 blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full bg-tattvam-purple-50 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
            <span className="h-2 w-2 rounded-full bg-tattvam-gold-400 animate-pulse" />
            A Sanctuary of Healing & Transformation
          </div>

          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-tattvam-purple-900 md:text-7xl lg:text-8xl">
            <span className="hero-word inline-block gradient-text">Heal.</span>
            <br />
            <span className="hero-word inline-block text-tattvam-purple-700">
              Empower.
            </span>
            <br />
            <span className="hero-word inline-block text-tattvam-gold-600">
              Transform.
            </span>
          </h1>

          <p className="hero-subtitle mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
            We are a sanctuary for those seeking lasting emotional alignment and
            inner strength. Through intuitive healing, ancient wisdom, and
            conscious awareness—we guide you back to your truth.
          </p>

          <div className="hero-ctas mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <PulsatingAura color="gold" intensity="medium" speed="slow">
              <Link href="/booking" className="btn-primary">
                Book Discovery Call
                <span className="ml-2">→</span>
              </Link>
            </PulsatingAura>
            <PulsatingAura color="gold" intensity="subtle" speed="slow">
              <Link href="#essence" className="btn-secondary">
                Discover Our Essence
              </Link>
            </PulsatingAura>
          </div>

          {/* Founder preview */}
          <div className="hero-founder mt-16 flex items-center justify-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-tattvam-gold-400">
              <Image
                src="/assets/homepage/founder.png"
                alt="Hema The Healer"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-semibold text-tattvam-purple-700">
                Hema The Healer
              </p>
              <p className="text-sm text-tattvam-purple-500">
                Founder & Lead Healer
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2">
          <PulsatingAura color="purple" intensity="subtle" speed="medium" as="div">
            <div className="h-8 w-5 rounded-full border-2 border-tattvam-purple-300 p-1">
              <div className="h-1.5 w-1.5 rounded-full bg-tattvam-purple-400 animate-bounce" />
            </div>
          </PulsatingAura>
        </div>
      </section>

      {/* The Essence Section */}
      <section
        id="essence"
        ref={essenceSectionRef}
        className="relative section-padding bg-tattvam-purple-900"
        style={{ perspective: "1000px" }}
      >
        <AuroraBackground variant="dark" />
        <FloatingOrbs count={4} />
        <div className="mx-auto max-w-6xl px-6">
          <GSAPReveal>
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-400/20 px-4 py-2 text-sm font-medium text-tattvam-gold-300">
                The Foundation
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
                The Essence of{" "}
                <span className="text-tattvam-gold-400">Tattvam Niramaya</span>
              </h2>
            </div>
          </GSAPReveal>

          <div className="grid gap-12 md:grid-cols-2">
            <div
              ref={tattvamCardRef}
              className="rounded-3xl bg-tattvam-purple-800/50 p-8 glass-card-dark"
              style={{ transformStyle: "preserve-3d" }}
            >
              <h3 className="font-serif text-2xl font-semibold text-tattvam-gold-400">
                <SanskritReveal text="Tattvam (तत्वम्)" />
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-purple-100/90">
                <span className="text-3xl font-serif text-tattvam-gold-300">
                  "
                </span>
                Truth, Reality, The Essential Nature of Being.
                <span className="text-3xl font-serif text-tattvam-gold-300">
                  "
                </span>
              </p>
              <p className="mt-4 text-purple-200/80">
                We believe that healing is not about fixing what is broken—it is
                about awakening to who you truly are. Your truth is your
                medicine. Your awareness is your cure.
              </p>
            </div>

            <div
              ref={niramayaCardRef}
              className="rounded-3xl bg-tattvam-purple-800/50 p-8 glass-card-dark"
              style={{ transformStyle: "preserve-3d" }}
            >
              <h3 className="font-serif text-2xl font-semibold text-tattvam-gold-400">
                <SanskritReveal text="Niramaya (निरामय)" />
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-purple-100/90">
                <span className="text-3xl font-serif text-tattvam-gold-300">
                  "
                </span>
                Freedom from disease, Perfect health, Wholeness.
                <span className="text-3xl font-serif text-tattvam-gold-300">
                  "
                </span>
              </p>
              <p className="mt-4 text-purple-200/80">
                True health emerges when we align with our highest truth. Not
                just the absence of illness, but the presence of vibrant energy,
                emotional freedom, and spiritual clarity.
              </p>
            </div>
          </div>

          <GSAPReveal delay={400}>
            <div className="mt-12 rounded-3xl bg-gradient-to-r from-tattvam-gold-400/10 to-transparent p-8 text-center">
              <p className="font-serif text-2xl text-white md:text-3xl">
                <PulsatingAura color="gold" intensity="medium" speed="slow">
                  <span className="text-tattvam-gold-400">
                    "The Truth That Heals"
                  </span>
                </PulsatingAura>
                <br />
                <span className="mt-2 block text-lg text-purple-200/80">
                  — Our philosophy in essence
                </span>
              </p>
            </div>
          </GSAPReveal>
        </div>
      </section>

      {/* Our Pillars Section */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl px-6">
          <GSAPReveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                What We Stand For
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                The Four Pillars of{" "}
                <span className="gradient-text">Our Practice</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-tattvam-purple-600/70">
                Ancient wisdom meets modern understanding in our holistic
                approach to healing.
              </p>
            </div>
          </GSAPReveal>

          <div ref={pillarsRef} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "✧",
                title: "Emotional & Energy Healing",
                description:
                  "Releasing ancestral blocks, healing inner wounds, and restoring energetic balance.",
              },
              {
                icon: "☽",
                title: "Women Empowerment",
                description:
                  "Supporting women to rise into their fullest potential through healing and awakening.",
              },
              {
                icon: "✦",
                title: "Frequency Medicine",
                description:
                  "Harnessing vibrational healing through ancient Indian wisdom and sound therapy.",
              },
              {
                icon: "◈",
                title: "Inner Child & Womb Healing",
                description:
                  "Deep trauma resolution through inner child work, past life regression, and womb energy activation.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="pillar-card card-hover group relative rounded-3xl bg-white p-8 shadow-soft"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-tattvam-purple-500/5 to-tattvam-gold-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tattvam-purple-100 to-tattvam-gold-100 text-3xl text-tattvam-purple-600">
                    <PulsatingAura
                      color="gold"
                      intensity="subtle"
                      speed="slow"
                    >
                      {pillar.icon}
                    </PulsatingAura>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-tattvam-purple-800">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-tattvam-purple-600/70">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section
        id="mission"
        className="relative section-padding bg-gradient-to-b from-tattvam-purple-50 to-white"
      >
        <AuroraBackground variant="light" />
        <FloatingOrbs count={3} />
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <GSAPReveal direction="left">
              <div className="relative">
                <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-tattvam-gold-200/50 blur-2xl" />
                <span className="inline-block rounded-full bg-tattvam-gold-100 px-4 py-2 text-sm font-medium text-tattvam-gold-700">
                  Our Mission
                </span>
                <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                  Impacting{" "}
                  <span className="text-tattvam-gold-500">2 Million Lives</span>
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-tattvam-purple-600/80">
                  In the next 3 years, we aim to touch 2 million lives by
                  helping people heal their pain, release ancestral blocks, and
                  align with their highest truth.
                </p>
                <div ref={checklistRef} className="mt-8 space-y-4">
                  {[
                    "Through intuitive healing and energy alignment",
                    "By cultivating conscious awareness in every seeker",
                    "Bridging ancient Vedic wisdom with modern understanding",
                  ].map((item, i) => (
                    <div key={i} className="check-item flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tattvam-gold-400 text-white text-xs font-bold">
                        ✓
                      </div>
                      <p className="text-tattvam-purple-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GSAPReveal>

            <GSAPReveal direction="right" delay={200}>
              <div className="relative">
                <div
                  ref={statNumbersRef}
                  className="glass-card rounded-[2rem] p-8"
                >
                  <div className="mb-6 text-center">
                    <span className="font-serif text-6xl font-bold text-tattvam-purple-600">
                      <span
                        className="stat-counter"
                        data-target="2"
                        data-suffix="M+"
                      >
                        0M+
                      </span>
                    </span>
                    <p className="mt-2 text-tattvam-purple-500">
                      Lives to Transform
                    </p>
                  </div>
                  <div className="divider-gold mb-6" />
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <span className="font-serif text-3xl font-bold text-tattvam-gold-500">
                        <span
                          className="stat-counter"
                          data-target="3"
                          data-suffix=""
                        >
                          0
                        </span>
                      </span>
                      <p className="text-sm text-tattvam-purple-500">Years</p>
                    </div>
                    <div>
                      <span className="font-serif text-3xl font-bold text-tattvam-gold-500">
                        <span
                          className="stat-counter"
                          data-target="100"
                          data-suffix="+"
                        >
                          0+
                        </span>
                      </span>
                      <p className="text-sm text-tattvam-purple-500">
                        Healers
                      </p>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-tattvam-purple-100/50 blur-2xl" />
              </div>
            </GSAPReveal>
          </div>
        </div>
      </section>

      {/* Meet The Founder Section */}
      <section id="founder" className="section-padding">
        <div className="mx-auto max-w-6xl px-6">
          <GSAPReveal>
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                The Visionary
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                Meet <span className="gradient-text">Hema The Healer</span>
              </h2>
            </div>
          </GSAPReveal>

          <div className="grid items-center gap-16 lg:grid-cols-2">
            <GSAPReveal direction="left">
              <ParallaxImage speed={-0.15}>
                <div className="relative">
                  <PulsatingAura
                    color="mixed"
                    intensity="medium"
                    speed="slow"
                    as="div"
                  >
                    <div className="glass-card relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                      <Image
                        src="/assets/homepage/founder.png"
                        alt="Hema The Healer - Founder of Tattvam Niramaya"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-tattvam-purple-900/30 to-transparent" />
                    </div>
                  </PulsatingAura>
                  {/* Decorative border */}
                  <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] border-2 border-tattvam-gold-300/30" />
                </div>
              </ParallaxImage>
            </GSAPReveal>

            <GSAPReveal direction="right" delay={200}>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-tattvam-purple-700">
                  I'm a spiritual healer, frequency therapist, and a fierce
                  advocate for women's emotional and mental well-being. With
                  years of experience blending ancient Indian wisdom, frequency
                  medicine, and psychological insight—I empower individuals to
                  rise into their fullest potential.
                </p>

                <div className="rounded-2xl bg-tattvam-purple-50 p-6">
                  <h4 className="font-serif text-lg font-semibold text-tattvam-purple-800">
                    Why Work With Me?
                  </h4>
                  <ul className="mt-4 space-y-3">
                    {[
                      "Impacted 1000+ lives globally",
                      "Certified Frequency & Spiritual Healer",
                      "10+ years in healing work",
                      "Rooted in ancient Indian energy principles",
                      "Women-centered, inclusive & trauma-informed",
                      "Bridging Science, Soul & Energy",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="text-tattvam-gold-500">›</span>
                        <span className="text-tattvam-purple-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <PulsatingAura color="gold" intensity="medium" speed="slow">
                  <Link href="/booking" className="btn-primary inline-flex">
                    Book a Session
                    <span className="ml-2">→</span>
                  </Link>
                </PulsatingAura>
              </div>
            </GSAPReveal>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="section-padding bg-tattvam-purple-900"
      >
        <AuroraBackground variant="dark" />
        <FloatingOrbs count={4} />
        <div className="mx-auto max-w-6xl px-6">
          <GSAPReveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-400/20 px-4 py-2 text-sm font-medium text-tattvam-gold-300">
                Transformation Stories
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
                Voices of{" "}
                <span className="text-tattvam-gold-400">Transformation</span>
              </h2>
            </div>
          </GSAPReveal>

          <div
            ref={testimonialsRef}
            className="grid gap-8 md:grid-cols-3"
            style={{ perspective: "800px" }}
          >
            {[
              {
                quote:
                  "I had the privilege of experiencing Past Life Regression (PLR) with Hema, and it was truly transformative. With ego state techniques, I resolved lifelong issues, freeing my mind and heart. Hema's calm and compassionate demeanor made connection effortless.",
                author: "Geetanjali Sarna",
                role: "Akashik Records Reader",
              },
              {
                quote:
                  "Hema helped me work on my relationship with my wife. The 21 day journey of healing with Hema was phenomenal. She is strict when it comes to following the instructions but it worked magically. We are expecting the good news soon. God Bless you.",
                author: "Namo",
                role: "IIT JEE Coach",
              },
              {
                quote:
                  "I highly recommend Hema for profound personal growth and healing. She's my go-to person forever for sure. In profound gratitude and full faith.",
                author: "Paul",
                role: "Designation",
              },
            ].map((testimonial, i) => (
              <div
                key={testimonial.author}
                className={`testimonial-card testimonial-float glass-card-dark h-full rounded-3xl p-8`}
                style={{
                  animationDelay: `${i * 0.8}s`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="mb-4 text-4xl text-tattvam-gold-400 opacity-50">
                  <PulsatingAura
                    color="gold"
                    intensity="subtle"
                    speed="medium"
                  >
                    "
                  </PulsatingAura>
                </div>
                <p className="text-purple-100/90">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-tattvam-purple-600/30 pt-6">
                  <p className="font-semibold text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-tattvam-purple-300/70">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Community Section */}
      <section className="relative section-padding">
        <AuroraBackground variant="light" />
        <FloatingOrbs count={5} />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div ref={communityRef}>
            <div className="glass-card rounded-[2rem] p-12">
              <div className="mb-6 text-5xl">
                <PulsatingAura color="gold" intensity="strong" speed="slow">
                  ✧
                </PulsatingAura>
              </div>
              <h2 className="font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                Join the <span className="gradient-text">#1 Community</span>
                <br />
                for Healers & Seekers
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-tattvam-purple-600/70">
                Be part of a growing tribe of conscious healers, coaches, and
                creators committed to healing themselves and others.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <PulsatingAura color="gold" intensity="medium" speed="slow">
                  <Link href="/booking" className="btn-primary">
                    Book Discovery Call
                    <span className="ml-2">→</span>
                  </Link>
                </PulsatingAura>
                <Link href="/courses" className="btn-secondary">
                  Explore Offerings
                </Link>
              </div>
              <p className="mt-8 text-xs text-tattvam-purple-400">
                Privacy Note: We respect your data and never share it with third
                parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-tattvam-purple-100 bg-tattvam-purple-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center">
                <div className="relative h-14 w-48">
                  <Image
                    src="/assets/homepage/logo.png"
                    alt="Tattvam Niramaya"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <p className="mt-4 text-sm text-tattvam-purple-600/70">
                The Truth That Heals. A sanctuary for holistic healing and
                transformation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-tattvam-purple-800">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-tattvam-purple-600/70">
                <li>
                  <Link href="#essence">Our Essence</Link>
                </li>
                <li>
                  <Link href="#mission">Our Mission</Link>
                </li>
                <li>
                  <Link href="#founder">Meet The Founder</Link>
                </li>
                <li>
                  <Link href="#testimonials">Stories</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-tattvam-purple-800">
                Services
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-tattvam-purple-600/70">
                <li>
                  <Link href="/services">Individual Healing</Link>
                </li>
                <li>
                  <Link href="/services">Corporate Wellness</Link>
                </li>
                <li>
                  <Link href="/workshops">Workshops</Link>
                </li>
                <li>
                  <Link href="/courses">Courses</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-tattvam-purple-800">
                Connect
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-tattvam-purple-600/70">
                <li>
                  <Link href="/booking">Book Discovery Call</Link>
                </li>
                <li>
                  <Link href="/feeds">Announcements</Link>
                </li>
                <li>
                  <a href="mailto:contact@tattvamniramaya.com">
                    contact@tattvamniramaya.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="divider-gold mt-8" />

          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-center text-sm text-tattvam-purple-500 md:flex-row">
            <p>© 2026 Tattvam Niramaya. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy-policy"
                className="transition hover:text-tattvam-purple-700"
              >
                Privacy Policy
              </Link>
              <span className="text-tattvam-purple-300">·</span>
              <p>Made with ✧ for healing</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
