/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import Link from "next/link";
import { FloatingOrbs, Reveal } from "@/components/animations";
import { LOGGER } from "@/lib/logger";

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

  return (
    <div className="relative overflow-x-hidden bg-tattvam-neutral-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src="/assets/homepage/logo.png"
                alt="Tattvam Niramaya Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-serif text-xl font-semibold text-tattvam-purple-700">
              Tattvam Niramaya
            </span>
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
            <Link
              href="/booking"
              className="btn-primary text-sm"
            >
              Book Discovery Call
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center section-padding">
        <FloatingOrbs count={6} />
        
        {/* Decorative elements */}
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-tattvam-gold-200/30 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-tattvam-purple-200/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <Reveal delay={100}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-tattvam-purple-50 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
              <span className="h-2 w-2 rounded-full bg-tattvam-gold-400 animate-pulse" />
              A Sanctuary of Healing & Transformation
            </div>
          </Reveal>
          
          <Reveal delay={300}>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-tattvam-purple-900 md:text-7xl lg:text-8xl">
              <span className="gradient-text">Heal.</span>
              <br />
              <span className="text-tattvam-purple-700">Empower.</span>
              <br />
              <span className="text-tattvam-gold-600">Transform.</span>
            </h1>
          </Reveal>
          
          <Reveal delay={500}>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
              We are a sanctuary for those seeking lasting emotional alignment and inner strength. 
              Through intuitive healing, ancient wisdom, and conscious awareness—we guide you back to your truth.
            </p>
          </Reveal>
          
          <Reveal delay={700}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/booking" className="btn-primary">
                Book Discovery Call
                <span className="ml-2">→</span>
              </Link>
              <Link href="#essence" className="btn-secondary">
                Discover Our Essence
              </Link>
            </div>
          </Reveal>
          
          {/* Founder preview */}
          <Reveal delay={900}>
            <div className="mt-16 flex items-center justify-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-tattvam-gold-400">
                <Image
                  src="/assets/homepage/founder.png"
                  alt="Hema The Healer"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-semibold text-tattvam-purple-700">Hema The Healer</p>
                <p className="text-sm text-tattvam-purple-500">Founder & Lead Healer</p>
              </div>
            </div>
          </Reveal>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-8 w-5 rounded-full border-2 border-tattvam-purple-300 p-1">
            <div className="h-1.5 w-1.5 rounded-full bg-tattvam-purple-400" />
          </div>
        </div>
      </section>

      {/* The Essence Section */}
      <section id="essence" className="relative section-padding bg-tattvam-purple-900">
        <FloatingOrbs count={4} />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-400/20 px-4 py-2 text-sm font-medium text-tattvam-gold-300">
                The Foundation
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
                The Essence of{" "}
                <span className="text-tattvam-gold-400">Tattvam Niramaya</span>
              </h2>
            </div>
          </Reveal>
          
          <div className="grid gap-12 md:grid-cols-2">
            <Reveal direction="left">
              <div className="rounded-3xl bg-tattvam-purple-800/50 p-8 glass-card-dark">
                <h3 className="font-serif text-2xl font-semibold text-tattvam-gold-400">
                  Tattvam (तत्वम्)
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-purple-100/90">
                  <span className="text-3xl font-serif text-tattvam-gold-300">"</span>
                  Truth, Reality, The Essential Nature of Being.
                  <span className="text-3xl font-serif text-tattvam-gold-300">"</span>
                </p>
                <p className="mt-4 text-purple-200/80">
                  We believe that healing is not about fixing what is broken—it is about awakening to 
                  who you truly are. Your truth is your medicine. Your awareness is your cure.
                </p>
              </div>
            </Reveal>
            
            <Reveal direction="right" delay={200}>
              <div className="rounded-3xl bg-tattvam-purple-800/50 p-8 glass-card-dark">
                <h3 className="font-serif text-2xl font-semibold text-tattvam-gold-400">
                  Niramaya (निरामय)
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-purple-100/90">
                  <span className="text-3xl font-serif text-tattvam-gold-300">"</span>
                  Freedom from disease, Perfect health, Wholeness.
                  <span className="text-3xl font-serif text-tattvam-gold-300">"</span>
                </p>
                <p className="mt-4 text-purple-200/80">
                  True health emerges when we align with our highest truth. Not just the absence of 
                  illness, but the presence of vibrant energy, emotional freedom, and spiritual clarity.
                </p>
              </div>
            </Reveal>
          </div>
          
          <Reveal delay={400}>
            <div className="mt-12 rounded-3xl bg-gradient-to-r from-tattvam-gold-400/10 to-transparent p-8 text-center">
              <p className="font-serif text-2xl text-white md:text-3xl">
                <span className="text-tattvam-gold-400">"The Truth That Heals"</span>
                <br />
                <span className="mt-2 block text-lg text-purple-200/80">
                  — Our philosophy in essence
                </span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Our Pillars Section */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                What We Stand For
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                The Four Pillars of{" "}
                <span className="gradient-text">Our Practice</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-tattvam-purple-600/70">
                Ancient wisdom meets modern understanding in our holistic approach to healing.
              </p>
            </div>
          </Reveal>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "✧",
                title: "Emotional & Energy Healing",
                description: "Releasing ancestral blocks, healing inner wounds, and restoring energetic balance.",
                delay: 100
              },
              {
                icon: "☽",
                title: "Women Empowerment",
                description: "Supporting women to rise into their fullest potential through healing and awakening.",
                delay: 200
              },
              {
                icon: "✦",
                title: "Frequency Medicine",
                description: "Harnessing vibrational healing through ancient Indian wisdom and sound therapy.",
                delay: 300
              },
              {
                icon: "◈",
                title: "Inner Child & Womb Healing",
                description: "Deep trauma resolution through inner child work, past life regression, and womb energy activation.",
                delay: 400
              }
            ].map((pillar) => (
              <Reveal key={pillar.title} delay={pillar.delay}>
                <div className="card-hover group relative rounded-3xl bg-white p-8 shadow-soft">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-tattvam-purple-500/5 to-tattvam-gold-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tattvam-purple-100 to-tattvam-gold-100 text-3xl text-tattvam-purple-600">
                      {pillar.icon}
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-tattvam-purple-800">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-tattvam-purple-600/70">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="relative section-padding bg-gradient-to-b from-tattvam-purple-50 to-white">
        <FloatingOrbs count={3} />
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <Reveal direction="left">
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
                  In the next 3 years, we aim to touch 2 million lives by helping people heal their pain, 
                  release ancestral blocks, and align with their highest truth.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    "Through intuitive healing and energy alignment",
                    "By cultivating conscious awareness in every seeker",
                    "Bridging ancient Vedic wisdom with modern understanding"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tattvam-gold-400 text-white text-xs font-bold">
                        ✓
                      </div>
                      <p className="text-tattvam-purple-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            
            <Reveal direction="right" delay={200}>
              <div className="relative">
                <div className="glass-card rounded-[2rem] p-8">
                  <div className="mb-6 text-center">
                    <span className="font-serif text-6xl font-bold text-tattvam-purple-600">2M+</span>
                    <p className="mt-2 text-tattvam-purple-500">Lives to Transform</p>
                  </div>
                  <div className="divider-gold mb-6" />
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <span className="font-serif text-3xl font-bold text-tattvam-gold-500">3</span>
                      <p className="text-sm text-tattvam-purple-500">Years</p>
                    </div>
                    <div>
                      <span className="font-serif text-3xl font-bold text-tattvam-gold-500">100+</span>
                      <p className="text-sm text-tattvam-purple-500">Healers</p>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-tattvam-purple-100/50 blur-2xl" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Meet The Founder Section */}
      <section id="founder" className="section-padding">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                The Visionary
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                Meet <span className="gradient-text">Hema The Healer</span>
              </h2>
            </div>
          </Reveal>
          
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <Reveal direction="left">
              <div className="relative">
                <div className="glass-card relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                  <Image
                    src="/assets/homepage/founder.png"
                    alt="Hema The Healer - Founder of Tattvam Niramaya"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tattvam-purple-900/30 to-transparent" />
                </div>
                {/* Decorative border */}
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] border-2 border-tattvam-gold-300/30" />
              </div>
            </Reveal>
            
            <Reveal direction="right" delay={200}>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-tattvam-purple-700">
                  I'm a spiritual healer, frequency therapist, and a fierce advocate for women's 
                  emotional and mental well-being. With years of experience blending ancient Indian 
                  wisdom, frequency medicine, and psychological insight—I empower individuals to 
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
                      "Bridging Science, Soul & Energy"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="text-tattvam-gold-500">›</span>
                        <span className="text-tattvam-purple-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link href="/booking" className="btn-primary inline-flex">
                  Book a Session
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section-padding bg-tattvam-purple-900">
        <FloatingOrbs count={4} />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-400/20 px-4 py-2 text-sm font-medium text-tattvam-gold-300">
                Transformation Stories
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
                Voices of{" "}
                <span className="text-tattvam-gold-400">Transformation</span>
              </h2>
            </div>
          </Reveal>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote: "I had the privilege of experiencing Past Life Regression (PLR) with Hema, and it was truly transformative. With ego state techniques, I resolved lifelong issues, freeing my mind and heart. Hema's calm and compassionate demeanor made connection effortless.",
                author: "Geetanjali Sarna",
                role: "Akashik Records Reader",
                delay: 100
              },
              {
                quote: "Hema helped me work on my relationship with my wife. The 21 day journey of healing with Hema was phenomenal. She is strict when it comes to following the instructions but it worked magically. We are expecting the good news soon. God Bless you.",
                author: "Namo",
                role: "IIT JEE Coach",
                delay: 200
              },
              {
                quote: "I highly recommend Hema for profound personal growth and healing. She's my go-to person forever for sure. In profound gratitude and full faith.",
                author: "Paul",
                role: "Designation",
                delay: 300
              }
            ].map((testimonial) => (
              <Reveal key={testimonial.author} delay={testimonial.delay}>
                <div className="glass-card-dark h-full rounded-3xl p-8">
                  <div className="mb-4 text-4xl text-tattvam-gold-400 opacity-50">"</div>
                  <p className="text-purple-100/90">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-6 border-t border-tattvam-purple-600/30 pt-6">
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-sm text-tattvam-purple-300/70">{testimonial.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Join Community Section */}
      <section className="relative section-padding">
        <FloatingOrbs count={5} />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="glass-card rounded-[2rem] p-12">
              <div className="mb-6 text-5xl">✧</div>
              <h2 className="font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                Join the{" "}
                <span className="gradient-text">#1 Community</span>
                <br />
                for Healers & Seekers
              </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-tattvam-purple-600/70">
                Be part of a growing tribe of conscious healers, coaches, and creators 
                committed to healing themselves and others.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/booking" className="btn-primary">
                  Book Discovery Call
                  <span className="ml-2">→</span>
                </Link>
                <Link href="/courses" className="btn-secondary">
                  Explore Offerings
                </Link>
              </div>
              <p className="mt-8 text-xs text-tattvam-purple-400">
                Privacy Note: We respect your data and never share it with third parties.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-tattvam-purple-100 bg-tattvam-purple-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <Image
                    src="/assets/homepage/logo.png"
                    alt="Tattvam Niramaya"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-serif text-lg font-semibold text-tattvam-purple-700">
                  Tattvam Niramaya
                </span>
              </div>
              <p className="mt-4 text-sm text-tattvam-purple-600/70">
                The Truth That Heals. A sanctuary for holistic healing and transformation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-tattvam-purple-800">Quick Links</h4>
              <ul className="mt-4 space-y-2 text-sm text-tattvam-purple-600/70">
                <li><Link href="#essence">Our Essence</Link></li>
                <li><Link href="#mission">Our Mission</Link></li>
                <li><Link href="#founder">Meet The Founder</Link></li>
                <li><Link href="#testimonials">Stories</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-tattvam-purple-800">Services</h4>
              <ul className="mt-4 space-y-2 text-sm text-tattvam-purple-600/70">
                <li><Link href="/services">Individual Healing</Link></li>
                <li><Link href="/services">Corporate Wellness</Link></li>
                <li><Link href="/workshops">Workshops</Link></li>
                <li><Link href="/courses">Courses</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-tattvam-purple-800">Connect</h4>
              <ul className="mt-4 space-y-2 text-sm text-tattvam-purple-600/70">
                <li><Link href="/booking">Book Discovery Call</Link></li>
                <li><Link href="/feeds">Announcements</Link></li>
                <li><a href="mailto:contact@tattvamniramaya.com">contact@tattvamniramaya.com</a></li>
              </ul>
            </div>
          </div>
          
          <div className="divider-gold mt-8" />
          
          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-center text-sm text-tattvam-purple-500 md:flex-row">
            <p>© 2026 Tattvam Niramaya. All rights reserved.</p>
            <p>Made with ✧ for healing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}