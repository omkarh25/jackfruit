"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { CourseCard } from "./course-card";
import type { Course } from "@/lib/types";

interface CourseGridProps {
  readonly courses: readonly Course[];
}

/**
 * Renders courses with purchase state from the learner profile.
 */
export function CourseGrid({ courses }: CourseGridProps) {
  const { profile } = useAuth();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} isPurchased={Boolean(profile?.purchasedCourseIds.includes(course.id))} />
      ))}
    </div>
  );
}