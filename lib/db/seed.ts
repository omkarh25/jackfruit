/**
 * Seed script to populate Firestore with initial data from lib/data.ts.
 *
 * Run this once after setting up Firestore:
 *   npx ts-node --skipProject -e "require('./lib/db/seed.ts').seedAll()"
 *
 * Or import and call seedAll() from a Next.js API route.
 */

import { createService, type ServiceRecord } from "./services";
import { createWorkshop, type WorkshopRecord } from "./workshops";
import { createCourse, type CourseRecord } from "./courses";
import { createTestimonial, type TestimonialRecord } from "./testimonials";
import { services, workshops, courses } from "@/lib/data";

export async function seedServices(): Promise<void> {
  console.log("Seeding services...");
  for (const service of services) {
    const record: Omit<ServiceRecord, "id" | "createdAt" | "updatedAt"> = {
      title: service.title,
      slug: service.slug,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: "Healing",
      outcomes: [...service.outcomes],
      isVisible: true,
    };
    await createService(record);
    console.log(`  ✓ ${service.title}`);
  }
}

export async function seedWorkshops(): Promise<void> {
  console.log("Seeding workshops...");
  for (const workshop of workshops) {
    const record: Omit<WorkshopRecord, "id" | "createdAt" | "updatedAt"> = {
      title: workshop.title,
      slug: workshop.slug,
      description: workshop.description,
      longDescription: workshop.longDescription ?? workshop.description,
      date: workshop.date,
      format: workshop.format,
      price: workshop.price ? parseInt(workshop.price.replace(/[^0-9]/g, "")) || 0 : 0,
      maxParticipants: 50,
      location: "Online",
      whatsappLink: workshop.whatsappLink,
      registrationsEnabled: true,
    };
    await createWorkshop(record);
    console.log(`  ✓ ${workshop.title}`);
  }
}

export async function seedCourses(): Promise<void> {
  console.log("Seeding courses...");
  for (const course of courses) {
    const record: Omit<CourseRecord, "id" | "createdAt" | "updatedAt"> = {
      title: course.title,
      slug: course.slug,
      description: course.description,
      level: course.level,
      price: course.price,
      lessons: course.lessons,
      outcomes: [...course.outcomes],
      isPublished: true,
      imageGradient: course.imageGradient,
    };
    await createCourse(record);
    console.log(`  ✓ ${course.title}`);
  }
}

export async function seedTestimonials(): Promise<void> {
  console.log("Seeding testimonials...");
  const testimonials: Omit<TestimonialRecord, "id" | "createdAt">[] = [
    {
      type: "text",
      name: "Geetanjali Sarna",
      role: "Akashik Records Reader",
      quote:
        "I had the privilege of experiencing Past Life Regression (PLR) with Hema, and it was truly transformative. With ego state techniques, I resolved lifelong issues, freeing my mind and heart.",
      isFeatured: true,
      isApproved: true,
    },
    {
      type: "text",
      name: "Namo",
      role: "IIT JEE Coach",
      quote:
        "Hema helped me work on my relationship with my wife. The 21 day journey of healing with Hema was phenomenal. She is strict when it comes to following the instructions but it worked magically.",
      isFeatured: true,
      isApproved: true,
    },
    {
      type: "text",
      name: "Paul",
      role: "Designation",
      quote:
        "I highly recommend Hema for profound personal growth and healing. She's my go-to person forever for sure. In profound gratitude and full faith.",
      isFeatured: true,
      isApproved: true,
    },
  ];

  for (const t of testimonials) {
    await createTestimonial(t);
    console.log(`  ✓ ${t.name}`);
  }
}

export async function seedAll(): Promise<void> {
  console.log("🌱 Starting Firestore seed...\n");
  try {
    await seedServices();
    await seedWorkshops();
    await seedCourses();
    await seedTestimonials();
    console.log("\n✅ Seed complete!");
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
    throw err;
  }
}
