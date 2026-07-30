"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getUserProfile,
  updateUserProfile,
  type FirestoreUserProfile,
} from "@/lib/db/users";

export function ProfileInfo() {
  const { firebaseUser } = useAuth();
  const [profile, setProfile] = useState<FirestoreUserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!firebaseUser?.uid) return;
    getUserProfile(firebaseUser.uid)
      .then(setProfile)
      .catch((e) => console.error("Failed to load profile:", e));
  }, [firebaseUser]);

  if (!firebaseUser || !profile) return null;

  function startEdit() {
    setName(profile?.name || "");
    setPhone(profile?.phone || "");
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseUser || !profile) return;
    setSaving(true);
    try {
      await updateUserProfile(firebaseUser.uid, { name: name.trim(), phone: phone.trim() });
      setProfile({ ...profile, name: name.trim(), phone: phone.trim() });
      setMessage({ text: "Profile updated.", type: "success" });
      setEditing(false);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to update profile.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Profile Info</h2>
        {!editing && (
          <button
            onClick={startEdit}
            className="rounded-full border border-tattvam-purple-200 px-4 py-1.5 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50"
          >
            Edit
          </button>
        )}
      </div>

      {message && (
        <p
          className={`mt-3 rounded-xl px-4 py-2 text-sm font-medium ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-4 flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-tattvam-gold-400">
          {profile.photoURL ? (
            <Image src={profile.photoURL} alt={profile.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-tattvam-purple-100 text-xl font-bold text-tattvam-purple-700">
              {(profile.name || "?")[0]}
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex-1 space-y-3">
            <div>
              <label className="text-xs font-medium text-tattvam-purple-600">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-tattvam-purple-600">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full border border-tattvam-purple-200 px-4 py-2 text-sm text-tattvam-purple-600 hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1">
            <p className="font-medium text-tattvam-purple-800">{profile.name}</p>
            <p className="text-sm text-tattvam-purple-600">{profile.email}</p>
            <p className="text-sm text-tattvam-purple-600">{profile.phone || "No phone added"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
