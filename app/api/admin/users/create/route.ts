export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export interface CreateUserRequestBody {
  name: string;
  email: string;
  phone?: string;
}

export interface CreateUserResponse {
  success: boolean;
  uid?: string;
  existedInAuth?: boolean;
  error?: string;
}

/**
 * POST /api/admin/users/create
 *
 * Adds an existing/offline customer to the system: creates a `users` doc with
 * role "learner". If a Firebase Auth account with that email already exists,
 * its uid is reused; otherwise a password-less Auth account is created (the
 * user can sign in via password reset / Google with the same email).
 */
export async function POST(req: Request) {
  try {
    await verifyAdminRequest(req);

    const { name, email, phone = "" }: CreateUserRequestBody = await req.json();
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json<CreateUserResponse>(
        { success: false, error: "name and email are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const auth = getAdminAuth();
    const db = getAdminDb();

    let uid: string;
    let existedInAuth = false;
    try {
      const existing = await auth.getUserByEmail(normalizedEmail);
      uid = existing.uid;
      existedInAuth = true;
    } catch {
      const created = await auth.createUser({
        email: normalizedEmail,
        displayName: name.trim(),
      });
      uid = created.uid;
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      return NextResponse.json<CreateUserResponse>(
        { success: false, error: "A user with this email already exists in the system." },
        { status: 409 }
      );
    }

    const now = new Date();
    await userRef.set({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: "learner",
      photoURL: null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json<CreateUserResponse>({ success: true, uid, existedInAuth });
  } catch (err) {
    console.error("[admin/users/create] error:", err);
    const message = err instanceof Error ? err.message : "Failed to create user";
    const statusCode = message.startsWith("Unauthorized") || message.startsWith("Forbidden") ? 401 : 500;
    return NextResponse.json<CreateUserResponse>(
      { success: false, error: message },
      { status: statusCode }
    );
  }
}
