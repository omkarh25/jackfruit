"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/app-shell/page-shell";
import { CourseGrid } from "@/components/courses/course-grid";
import { getPublishedCourses, type CourseRecord } from "@/lib/db/courses";
import { courses as staticCourses } from "@/lib/data";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublishedCourses()
      .then((firestoreCourses) => {
        setCourses(
          firestoreCourses.length > 0
            ? firestoreCourses
            : staticCourses.map((c) => ({
                id: c.id,
                title: c.title,
                slug: c.slug,
                description: c.description,
                level: c.level,
                price: c.price,
                lessons: c.lessons,
                outcomes: [...c.outcomes],
                isPublished: true,
                imageGradient: c.imageGradient,
              }))
        );
      })
      .catch(() => {
        setCourses(
          staticCourses.map((c) => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            description: c.description,
            level: c.level,
            price: c.price,
            lessons: c.lessons,
            outcomes: [...c.outcomes],
            isPublished: true,
            imageGradient: c.imageGradient,
          }))
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageShell
      eyebrow="Courses"
      title="Video courses for breath, balance, and daily wellbeing"
      description="Browse structured video courses, buy access, and watch lessons from your learner profile."
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading courses...</div>
        </div>
      ) : (
        <CourseGrid
          courses={courses.map((c) => ({
            id: c.id!,
            slug: c.slug,
            title: c.title,
            level: c.level,
            lessons: c.lessons,
            completion: 0,
            description: c.description,
            price: c.price,
            imageGradient: c.imageGradient ?? "from-tattvam-purple-200 to-tattvam-gold-200",
            outcomes: c.outcomes,
            videos: [],
          }))}
        />
      )}
    </PageShell>
  );
}
