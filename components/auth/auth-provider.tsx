"use client";

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getFirebaseAuth, getGoogleAuthProvider } from "@/lib/firebase";
import { LOGGER } from "@/lib/logger";
import { addPurchasedCourse, getStoredProfile } from "@/lib/profile-store";
import { upsertUserProfile, getUserProfile, toUserProfile } from "@/lib/db/users";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  readonly firebaseUser: User | null;
  readonly profile: UserProfile | null;
  readonly isLoading: boolean;
  readonly isAdmin: boolean;
  readonly isCoach: boolean;
  readonly isStaff: boolean;
  readonly loginWithGoogle: () => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly unlockCourse: (courseId: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Provides Firebase Google auth and learner profile state synced to Firestore.
 */
export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Firebase Auth user to Firestore profile on auth state change
  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          // Try to get existing Firestore profile
          let firestoreProfile = await getUserProfile(user.uid);

          if (!firestoreProfile) {
            // Create new profile in Firestore
            const stored = getStoredProfile(user.uid);
            await upsertUserProfile(user.uid, {
              uid: user.uid,
              name: user.displayName ?? stored?.name ?? "Tatvam Learner",
              email: user.email ?? stored?.email ?? "",
              photoURL: user.photoURL ?? stored?.photoURL,
              role: "learner",
            });
            firestoreProfile = await getUserProfile(user.uid);
          }

          const userProfile = firestoreProfile ? toUserProfile(firestoreProfile) : null;
          setProfile(userProfile);
          LOGGER.info("Auth state synced with Firestore", { uid: user.uid, role: firestoreProfile?.role });
        } catch (err) {
          LOGGER.error("Failed to sync profile to Firestore", { error: String(err) });
          // Fallback to localStorage profile
          const stored = getStoredProfile(user.uid);
          setProfile(stored);
        }
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const result = await signInWithPopup(auth, getGoogleAuthProvider());
    const user = result.user;

    // Sync to Firestore immediately after login
    try {
      const existing = await getUserProfile(user.uid);
      if (!existing) {
        await upsertUserProfile(user.uid, {
          uid: user.uid,
          name: user.displayName ?? "Tatvam Learner",
          email: user.email ?? "",
          photoURL: user.photoURL ?? undefined,
          role: "learner",
        });
      }
      const firestoreProfile = await getUserProfile(user.uid);
      setProfile(firestoreProfile ? toUserProfile(firestoreProfile) : null);
    } catch (err) {
      LOGGER.error("Failed to sync login to Firestore", { error: String(err) });
    }

    setFirebaseUser(user);
    LOGGER.info("Google login completed", { uid: user.uid });
  }, []);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setFirebaseUser(null);
    setProfile(null);
    LOGGER.info("User logged out");
  }, []);

  const unlockCourse = useCallback(
    (courseId: string) => {
      if (!profile) {
        return;
      }

      const updatedProfile = addPurchasedCourse(profile, courseId);
      setProfile(updatedProfile);
      LOGGER.info("Course unlocked for learner", { courseId, uid: profile.uid });
    },
    [profile]
  );

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  const isCoach = profile?.role === "coach";
  const isStaff = isAdmin || isCoach;

  const value = useMemo(
    () => ({ firebaseUser, profile, isLoading, isAdmin, isCoach, isStaff, loginWithGoogle, logout, unlockCourse }),
    [firebaseUser, profile, isLoading, isAdmin, isCoach, isStaff, loginWithGoogle, logout, unlockCourse]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Accesses the learner auth/profile context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
