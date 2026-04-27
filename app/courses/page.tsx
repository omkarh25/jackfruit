import { PageShell } from "@/components/app-shell/page-shell";
import { CourseGrid } from "@/components/courses/course-grid";
import { courses } from "@/lib/data";

export default function CoursesPage() {
  return (
    <PageShell
      eyebrow="Courses"
      title="Video courses for breath, balance, and daily wellbeing"
      description="Browse structured video courses, buy access, and watch lessons from your learner profile."
    >
      <CourseGrid courses={courses} />
    </PageShell>
  );
}