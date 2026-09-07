const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Load .env.local variables
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\n/g, "\n");
      }
      process.env[key] = value;
    }
  });
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function grantTrialMembership({
  email,
  name = "Hemalatha Gattam",
  tier = "RISE", // "RISE" or "INNER CIRCLE"
  mode = "online", // "online" or "offline"
  durationDays = 30, // Trial length in days
}) {
  console.log(`Starting trial membership grant for: ${email}`);

  // 1. Get or create Firebase Auth user
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`Found existing Firebase Auth user: ${userRecord.uid}`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      console.log(`User not found in Auth. Creating user account for ${email}...`);
      userRecord = await auth.createUser({
        email: email,
        displayName: name,
        emailVerified: true,
      });
      console.log(`Created new Firebase Auth user with UID: ${userRecord.uid}`);
    } else {
      throw err;
    }
  }

  const uid = userRecord.uid;

  // 2. Create or update Firestore user document
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();

  const now = new Date();
  if (!userSnap.exists) {
    console.log(`Creating user profile document in Firestore for UID: ${uid}`);
    await userRef.set({
      uid: uid,
      name: userRecord.displayName || name,
      email: email,
      role: "learner",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    console.log(`User profile already exists in Firestore for UID: ${uid}`);
  }

  // 3. Create active trial membership record
  const startDate = now;
  const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const membershipRef = await db.collection("memberships").add({
    userId: uid,
    tier: tier,
    mode: mode,
    durationMonths: Math.round(durationDays / 30) || 1,
    startDate: startDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    status: "active",
    paymentId: "TRIAL_GRANT",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`\n✅ Success! Granted ${tier} (${mode}) trial membership:`);
  console.log(` - Document ID: ${membershipRef.id}`);
  console.log(` - User Email: ${email}`);
  console.log(` - User UID: ${uid}`);
  console.log(` - Start Date: ${startDate.toLocaleDateString()}`);
  console.log(` - Expiry Date: ${expiryDate.toLocaleDateString()} (${durationDays} days)`);
}

const emailArg = process.argv[2] || "hemalatha.gattam@gmail.com";
const tierArg = process.argv[3] || "RISE"; // RISE or INNER CIRCLE
const daysArg = parseInt(process.argv[4], 10) || 30;

grantTrialMembership({
  email: emailArg,
  tier: tierArg,
  durationDays: daysArg,
}).catch((err) => {
  console.error("Error granting trial membership:", err);
  process.exit(1);
});
