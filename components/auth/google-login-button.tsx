"use client";

import Image from "next/image";
import { useAuth } from "./auth-provider";

/**
 * Google login/profile control for landing and protected course flows.
 */
export function GoogleLoginButton() {
  const { isLoading, loginWithGoogle, logout, profile } = useAuth();

  if (isLoading) {
    return <span className="rounded-full bg-white/70 px-5 py-3 text-sm font-semibold text-jackfruit-deep">Loading profile…</span>;
  }

  if (profile) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-full bg-white/80 p-2 shadow-sm">
        {profile.photoURL ? <Image src={profile.photoURL} alt={profile.name} width={36} height={36} className="rounded-full" /> : null}
        <span className="px-2 text-sm font-semibold text-jackfruit-deep">{profile.name}</span>
        <button onClick={logout} className="rounded-full bg-jackfruit-deep px-4 py-2 text-sm font-semibold text-white">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button onClick={loginWithGoogle} className="rounded-full bg-jackfruit-deep px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-jackfruit-leaf">
      Continue with Google
    </button>
  );
}