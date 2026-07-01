import { getAdminAuth, getAdminDb } from "./firebase-admin";

export interface VerifiedAdmin {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
}

export async function verifyAdminRequest(req: Request): Promise<VerifiedAdmin> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: missing Authorization header");
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken) {
    throw new Error("Unauthorized: missing token");
  }

  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(idToken);
  const uid = decoded.uid;

  const db = getAdminDb();
  const userSnap = await db.collection("users").doc(uid).get();
  if (!userSnap.exists) {
    throw new Error("Unauthorized: user not found");
  }

  const userData = userSnap.data() as {
    name?: string;
    email?: string;
    role?: string;
  };

  if (userData.role !== "admin" && userData.role !== "super_admin") {
    throw new Error("Forbidden: admin access required");
  }

  return {
    uid,
    name: userData.name || "Admin",
    email: userData.email || "",
    role: userData.role as "admin" | "super_admin",
  };
}
