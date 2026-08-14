"use client";

import type { UserProfile } from "./types";

const profileKeyPrefix = "jackfruit.profile";

/**
 * Builds the local profile storage key for a Firebase user.
 */
function getProfileKey(uid: string): string {
  return `${profileKeyPrefix}.${uid}`;
}

/**
 * Reads the learner profile persisted for a Firebase UID.
 */
export function getStoredProfile(uid: string): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawProfile = window.localStorage.getItem(getProfileKey(uid));
  return rawProfile ? (JSON.parse(rawProfile) as UserProfile) : null;
}

/**
 * Persists a learner profile in local storage.
 */
export function saveProfile(profile: UserProfile): void {
  window.localStorage.setItem(getProfileKey(profile.uid), JSON.stringify(profile));
}

/**
 * Marks a course as purchased for the current learner.
 */
export function addPurchasedCourse(profile: UserProfile, courseId: string): UserProfile {
  const purchasedCourseIds = Array.from(new Set([...profile.purchasedCourseIds, courseId]));
  const updatedProfile: UserProfile = {
    ...profile,
    purchasedCourseIds,
    updatedAt: new Date().toISOString()
  };

  saveProfile(updatedProfile);
  return updatedProfile;
}