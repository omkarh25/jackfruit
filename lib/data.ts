import type { BookingSlot, Course, FeedItem, ServiceOffering, Workshop } from "./types";

/**
 * Seed content used by the MVP learner app until the database layer is connected.
 */
export const feedItems: readonly FeedItem[] = [
  {
    id: "feed-1",
    title: "New pranayama workshop opens this week",
    description: "Join the guided breathwork circle for better sleep, digestion, and calm focus.",
    tag: "Workshop",
    publishedAt: "Today"
  },
  {
    id: "feed-2",
    title: "Ayurvedic daily routine checklist",
    description: "A practical dinacharya checklist has been added to your resources library.",
    tag: "Resource",
    publishedAt: "Yesterday"
  },
  {
    id: "feed-3",
    title: "Book your 1:1 consultation slot",
    description: "Limited consultation windows are available for personalized wellness planning.",
    tag: "Booking",
    publishedAt: "2 days ago"
  }
];

export const services: readonly ServiceOffering[] = [
  {
    id: "service-1",
    title: "Personal Wellness Consultation",
    description: "A focused 1:1 consultation to understand your lifestyle, goals, and wellness blockers.",
    duration: "60 min",
    price: "₹1,999",
    outcomes: ["Lifestyle assessment", "Personal next steps", "Follow-up recommendations"]
  },
  {
    id: "service-2",
    title: "Breathwork Reset Package",
    description: "A guided package for building a consistent breathwork and nervous-system reset practice.",
    duration: "3 sessions",
    price: "₹4,999",
    outcomes: ["Practice plan", "Live guidance", "Progress review"]
  }
];

export const workshops: readonly Workshop[] = [
  {
    id: "workshop-1",
    title: "Sleep Better with Breath",
    date: "30 Apr, 7:00 PM",
    format: "Live Zoom",
    description: "A practical live workshop with breathing sequences for better sleep quality."
  },
  {
    id: "workshop-2",
    title: "Digestive Fire Basics",
    date: "Recording available",
    format: "Recording",
    description: "Watch the previous session on agni, food timing, and simple habit corrections."
  }
];

export const courses: readonly Course[] = [
  {
    id: "course-1",
    slug: "course1",
    title: "Breath Awareness Foundations",
    level: "Beginner",
    lessons: 5,
    completion: 0,
    description: "Start your wellness journey with gentle awareness practices for calm, clarity, and daily balance.",
    price: "₹1,499",
    imageGradient: "from-amber-200 via-orange-100 to-emerald-100",
    outcomes: ["Breath awareness", "Daily grounding ritual", "Simple self-practice structure"],
    videos: [
      { id: "c1-v1", title: "Lesson 1 · Settling into awareness", duration: "Video", src: "/courses/course1/haiku_001_main_f4096af.mp4" },
      { id: "c1-v2", title: "Lesson 2 · Breath and body scan", duration: "Video", src: "/courses/course1/haiku_002_main_c70d0e6.mp4" },
      { id: "c1-v3", title: "Lesson 3 · Gentle rhythm practice", duration: "Video", src: "/courses/course1/haiku_003_main_f89ae07.mp4" },
      { id: "c1-v4", title: "Lesson 4 · Calm focus sequence", duration: "Video", src: "/courses/course1/haiku_004_main_8d5b87f.mp4" },
      { id: "c1-v5", title: "Lesson 5 · Building consistency", duration: "Video", src: "/courses/course1/haiku_005_main_1c91115.mp4" }
    ]
  },
  {
    id: "course-2",
    slug: "course2",
    title: "Pranayama for Daily Balance",
    level: "All levels",
    lessons: 5,
    completion: 0,
    description: "A progressive video course to build safe pranayama habits for energy, rest, and emotional steadiness.",
    price: "₹1,999",
    imageGradient: "from-emerald-200 via-lime-100 to-yellow-100",
    outcomes: ["Pranayama basics", "Energy regulation", "Practice safety and sequencing"],
    videos: [
      { id: "c2-v1", title: "Lesson 1 · Preparing for pranayama", duration: "Video", src: "/courses/course2/haiku_006_main_6a8a858.mp4" },
      { id: "c2-v2", title: "Lesson 2 · Foundational breathing", duration: "Video", src: "/courses/course2/haiku_007_main_5baafe0.mp4" },
      { id: "c2-v3", title: "Lesson 3 · Balancing practice", duration: "Video", src: "/courses/course2/haiku_008_main_b719883.mp4" },
      { id: "c2-v4", title: "Lesson 4 · Evening reset", duration: "Video", src: "/courses/course2/haiku_009_main_0bcfe1e.mp4" },
      { id: "c2-v5", title: "Lesson 5 · Personal routine", duration: "Video", src: "/courses/course2/haiku_010_main_d5d5ffc.mp4" }
    ]
  }
];

/**
 * Finds a course by route slug.
 */
export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export const bookingSlots: readonly BookingSlot[] = [
  { id: "slot-1", date: "Mon, 29 Apr", time: "10:00 AM", status: "Available" },
  { id: "slot-2", date: "Wed, 1 May", time: "5:30 PM", status: "Filling fast" },
  { id: "slot-3", date: "Sat, 4 May", time: "11:30 AM", status: "Available" }
];