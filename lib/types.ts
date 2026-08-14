export interface ServiceOffering {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly duration: string;
  readonly price: string;
  readonly outcomes: readonly string[];
  readonly paymentRedirectUrl?: string;
}

export interface Workshop {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly format: "Live Zoom" | "Recording" | "Offline";
  readonly description: string;
  readonly longDescription?: string;
  readonly price?: string;
  readonly whatsappLink?: string;
  readonly venueLink?: string;
  readonly paymentRedirectUrl?: string;
}

export interface Course {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly level: string;
  readonly lessons: number;
  readonly completion: number;
  readonly description: string;
  readonly price: string;
  readonly imageGradient: string;
  readonly outcomes: readonly string[];
  readonly videos: readonly CourseVideo[];
}

export interface CourseVideo {
  readonly id: string;
  readonly title: string;
  readonly duration: string;
  readonly src: string;
}

export type TestimonialType = "text" | "video" | "image";

export interface TestimonialItem {
  readonly id: string;
  readonly type: TestimonialType;
  readonly name: string;
  readonly role: string;
  readonly quote?: string;
  readonly mediaUrl?: string;
  readonly isFeatured: boolean;
  readonly isApproved: boolean;
  readonly createdAt: string;
}

export interface UserProfile {
  readonly uid: string;
  readonly name: string;
  readonly email: string;
  readonly photoURL?: string;
  readonly role?: "learner" | "admin" | "super_admin" | "coach";
  readonly purchasedCourseIds: readonly string[];
  readonly bookingIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}