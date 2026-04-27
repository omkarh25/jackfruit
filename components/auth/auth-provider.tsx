"use client";

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getFirebaseAuth, getGoogleAuthProvider } from "@/lib/firebase";
import { LOGGER } from "@/lib/logger";
import { addPurchasedCourse, upsertProfileFromFirebaseUser } from "@/lib/profile-store";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  readonly firebaseUser: User | null;
  readonly profile: UserProfile | null;
  readonly isLoading: boolean;
  readonly loginWithGoogle: () => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly unlockCourse: (courseId: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Provides Firebase Google auth and local learner profile state to the app.
 */
export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setProfile(user ? upsertProfileFromFirebaseUser(user) : null);
      setIsLoading(false);
      LOGGER.info("Auth state changed", { isSignedIn: Boolean(user) });
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const result = await signInWithPopup(auth, getGoogleAuthProvider());
    setFirebaseUser(result.user);
    setProfile(upsertProfileFromFirebaseUser(result.user));
    LOGGER.info("Google login completed", { uid: result.user.uid });
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

  const value = useMemo(
    () => ({ firebaseUser, profile, isLoading, loginWithGoogle, logout, unlockCourse }),
    [firebaseUser, profile, isLoading, loginWithGoogle, logout, unlockCourse]
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