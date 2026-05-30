/**
 * Firestore database API layer for the Jackfruit app.
 *
 * All collections:
 * - users        (docId = Firebase Auth UID)
 * - payments     (docId = auto)
 * - bookings     (docId = auto)
 * - workshops    (docId = auto)
 * - services     (docId = auto)
 * - courses      (docId = auto)
 * - testimonials (docId = auto)
 * - coupons      (docId = coupon code)
 * - slots        (docId = auto)
 */

export * from "./users";
export * from "./payments";
export * from "./bookings";
export * from "./workshops";
export * from "./services";
export * from "./courses";
export * from "./testimonials";
export * from "./coupons";
export * from "./slots";
