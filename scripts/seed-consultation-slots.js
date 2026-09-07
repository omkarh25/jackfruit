/**
 * Standalone script: bulk-create consultation slots for September.
 *
 * Usage:
 *   node scripts/seed-consultation-slots.js [year] [month(0-11)] [startDay] [endDay]
 *
 * Defaults: current year, September (8), days 1–30/31.
 * Mon–Thu, 11:00–16:00, 30 min, ₹555 each.
 * Idempotent — re-running on the same range skips already-created slots.
 *
 * Reads credentials from .env.local (FIREBASE_ADMIN_PROJECT_ID etc.).
 */

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
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const admin = require("firebase-admin");

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

const args = process.argv.slice(2);
const now = new Date();
const year = parseInt(args[0], 10) || now.getFullYear();
const month = args[1] !== undefined ? parseInt(args[1], 10) : 8; // September
const startDay = parseInt(args[2], 10) || 1;
const endDay = parseInt(args[3], 10) || new Date(year, month + 1, 0).getDate();

const weekdays = [1, 2, 3, 4]; // Mon–Thu
const startHour = 11;
const endHour = 16;
const durationMinutes = 30;
const price = 555;

function pad(n) { return String(n).padStart(2, "0"); }
function fmtDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

async function main() {
  console.log(`\n📅 Generating consultation slots for ${fmtDate(new Date(year, month, startDay))} → ${fmtDate(new Date(year, month, endDay))}`);
  console.log(`   Weekdays: Mon–Thu`);
  console.log(`   Hours:    ${startHour}:00 – ${endHour}:00 in ${durationMinutes}-min slots`);
  console.log(`   Price:    ₹${price}\n`);

  // Fetch existing slots in range (idempotency).
  const existing = await db.collection("slots")
    .where("date", ">=", fmtDate(new Date(year, month, startDay)))
    .where("date", "<=", fmtDate(new Date(year, month, endDay)))
    .get();
  const existingKeys = new Set();
  existing.forEach((doc) => {
    const data = doc.data();
    if (data.date && data.time) existingKeys.add(`${data.date}|${data.time}`);
  });
  console.log(`   Existing slots in range: ${existingKeys.size} (will be skipped)\n`);

  const stepMs = durationMinutes * 60 * 1000;
  let created = 0, skipped = 0;
  const days = {};

  for (let day = startDay; day <= endDay; day++) {
    const d = new Date(year, month, day);
    const dow = d.getDay();
    if (!weekdays.includes(dow)) continue;

    const dateStr = fmtDate(d);
    days[dateStr] = 0;

    for (let h = startHour; h < endHour; h += durationMinutes / 60) {
      const hh = Math.floor(h);
      const mm = Math.round((h - hh) * 60);
      const time = `${pad(hh)}:${pad(mm)}`;
      const key = `${dateStr}|${time}`;
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }
      await db.collection("slots").add({
        date: dateStr,
        time,
        duration: `${durationMinutes} min`,
        price,
        meetingLink: "",
        status: "available",
        bookedBy: null,
        heldAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      created++;
      days[dateStr]++;
    }
  }

  console.log("\n✅ Done.\n");
  console.log(`   Created:        ${created}`);
  console.log(`   Skipped:        ${skipped} (already existed)`);
  console.log(`   Days affected:  ${Object.keys(days).length}`);
  console.log(`   Slots per day:  ${Object.values(days).length ? Math.max(...Object.values(days)) : 0}\n`);
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
