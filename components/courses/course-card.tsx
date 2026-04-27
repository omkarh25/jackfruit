import Link from "next/link";
import type { Course } from "@/lib/types";

interface CourseCardProps {
  readonly course: Course;
  readonly isPurchased: boolean;
}

/**
 * Displays a course in the responsive course catalog grid.
 */
export function CourseCard({ course, isPurchased }: CourseCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-soft transition hover:-translate-y-1">
      <div className={`min-h-52 bg-gradient-to-br ${course.imageGradient} p-6`}>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-jackfruit-deep">{course.level}</span>
          <span className="rounded-full bg-jackfruit-deep px-3 py-1 text-xs font-bold text-white">{isPurchased ? "Unlocked" : course.price}</span>
        </div>
        <h2 className="mt-16 text-3xl font-bold text-jackfruit-deep">{course.title}</h2>
      </div>
      <div className="p-6">
        <p className="leading-7 text-jackfruit-deep/70">{course.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {course.outcomes.map((outcome) => (
            <span key={outcome} className="rounded-full bg-jackfruit-gold/20 px-3 py-1 text-xs font-semibold text-jackfruit-deep">
              {outcome}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-jackfruit-leaf">{course.lessons} video lessons</span>
          <Link href={`/courses/${course.slug}`} className="rounded-full bg-jackfruit-leaf px-5 py-3 text-sm font-bold text-white hover:bg-jackfruit-deep">
            {isPurchased ? "Watch course" : "View details"}
          </Link>
        </div>
      </div>
    </article>
  );
}