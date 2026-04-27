"use client";

import { useState } from "react";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { RazorpayPaymentButton } from "@/components/payments/razorpay-payment-button";
import { useAuth } from "@/components/auth/auth-provider";
import type { Course } from "@/lib/types";

const paymentButtonId = "pl_SiNXqS3vOzGc7l";

interface CourseAccessPanelProps {
  readonly course: Course;
}

/**
 * Handles login, MVP payment unlock, and video course playback.
 */
export function CourseAccessPanel({ course }: CourseAccessPanelProps) {
  const { profile, unlockCourse } = useAuth();
  const [activeVideoSrc, setActiveVideoSrc] = useState(course.videos[0]?.src);
  const isPurchased = Boolean(profile?.purchasedCourseIds.includes(course.id));

  if (!profile) {
    return (
      <section className="rounded-[2rem] bg-white p-8 shadow-soft">
        <h2 className="text-3xl font-bold text-jackfruit-deep">Login to buy and watch</h2>
        <p className="mt-3 text-jackfruit-deep/70">Use Google login to create your learner profile for course purchases, watch history, and bookings.</p>
        <div className="mt-6">
          <GoogleLoginButton />
        </div>
      </section>
    );
  }

  if (!isPurchased) {
    return (
      <section className="grid gap-6 rounded-[2rem] bg-white p-8 shadow-soft lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-3xl font-bold text-jackfruit-deep">Buy this course</h2>
          <p className="mt-3 leading-7 text-jackfruit-deep/70">
            Complete payment using Razorpay. For this MVP, click unlock after completing payment to save course access in your local learner profile.
          </p>
          <ul className="mt-5 grid gap-2 text-jackfruit-deep/75">
            {course.outcomes.map((outcome) => (
              <li key={outcome}>✦ {outcome}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-jackfruit-cream p-5">
          <p className="text-2xl font-bold text-jackfruit-deep">{course.price}</p>
          <div className="mt-5">
            <RazorpayPaymentButton paymentButtonId={paymentButtonId} />
          </div>
          <button onClick={() => unlockCourse(course.id)} className="mt-5 w-full rounded-full bg-jackfruit-leaf px-5 py-3 text-sm font-bold text-white hover:bg-jackfruit-deep">
            I completed payment · Unlock course
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-[2rem] bg-black shadow-soft">
        <video key={activeVideoSrc} controls className="aspect-video w-full" src={activeVideoSrc}>
          <track kind="captions" />
        </video>
      </div>
      <aside className="rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-bold text-jackfruit-deep">Lessons</h2>
        <div className="mt-4 grid gap-3">
          {course.videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideoSrc(video.src)}
              className="rounded-2xl border border-jackfruit-deep/10 p-4 text-left text-sm font-semibold text-jackfruit-deep hover:border-jackfruit-leaf hover:bg-jackfruit-cream"
            >
              {video.title}
              <span className="block text-xs font-medium text-jackfruit-leaf">{video.duration}</span>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}