import { notFound } from "next/navigation";
import { PageShell } from "@/components/app-shell/page-shell";
import { CourseAccessPanel } from "@/components/courses/course-access-panel";
import { courses, getCourseBySlug } from "@/lib/data";

interface CourseDetailPageProps {
  readonly params: {
    readonly slug: string;
  };
}

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  return (
    <PageShell eyebrow={`${course.level} · ${course.lessons} lessons`} title={course.title} description={course.description}>
      <CourseAccessPanel course={course} />
    </PageShell>
  );
}