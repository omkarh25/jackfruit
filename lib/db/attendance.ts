import { getAdminDb } from "@/lib/firebase-admin";
import type { Timestamp } from "firebase/firestore";

export type AttendanceStatus = "P" | "A" | "ML";

export interface AttendanceRecord {
  id?: string;
  userId: string;
  userName: string;
  email: string;
  itemType: "workshop" | "consultation" | "service" | "course";
  itemId: string;
  itemName: string;
  sessionDate: string;
  attendanceStatus: AttendanceStatus;
  remarks?: string;
  markedByAdminId: string;
  markedByAdminName: string;
  markedDateTime: Timestamp | Date;
  lastModifiedBy?: string;
  lastModifiedByName?: string;
  lastModifiedDateTime?: Timestamp | Date;
}

export interface AttendanceAuditLog {
  id?: string;
  attendanceId: string;
  oldStatus?: AttendanceStatus;
  newStatus: AttendanceStatus;
  changedByAdminId: string;
  changedByAdminName: string;
  changedDateTime: Timestamp | Date;
  remarks?: string;
}

export interface SaveAttendanceInput {
  userId: string;
  userName: string;
  email: string;
  status: AttendanceStatus;
  remarks?: string;
}

export async function saveAttendanceBulk(
  itemType: AttendanceRecord["itemType"],
  itemId: string,
  itemName: string,
  sessionDate: string,
  records: SaveAttendanceInput[],
  admin: { uid: string; name: string }
): Promise<void> {
  const db = getAdminDb();
  const attendanceRef = db.collection("attendance");

  const existingSnap = await attendanceRef
    .where("itemType", "==", itemType)
    .where("itemId", "==", itemId)
    .where("sessionDate", "==", sessionDate)
    .get();

  const existingByUserId = new Map<string, AttendanceRecord & { docId: string }>();
  for (const doc of existingSnap.docs) {
    const data = doc.data() as AttendanceRecord;
    existingByUserId.set(data.userId, { ...data, docId: doc.id });
  }

  const batch = db.batch();
  const now = new Date();

  for (const record of records) {
    const existing = existingByUserId.get(record.userId);

    if (existing) {
      const oldStatus = existing.attendanceStatus;
      const newStatus = record.status;
      const ref = attendanceRef.doc(existing.docId);

      batch.update(ref, {
        attendanceStatus: newStatus,
        remarks: record.remarks || "",
        lastModifiedBy: admin.uid,
        lastModifiedByName: admin.name,
        lastModifiedDateTime: now,
      });

      if (oldStatus !== newStatus) {
        const auditRef = db.collection("attendanceAuditLogs").doc();
        batch.set(auditRef, {
          attendanceId: existing.docId,
          oldStatus,
          newStatus,
          changedByAdminId: admin.uid,
          changedByAdminName: admin.name,
          changedDateTime: now,
          remarks: record.remarks ?? null,
        });
      }
    } else {
      const ref = attendanceRef.doc();
      batch.set(ref, {
        userId: record.userId,
        userName: record.userName,
        email: record.email,
        itemType,
        itemId,
        itemName,
        sessionDate,
        attendanceStatus: record.status,
        remarks: record.remarks || "",
        markedByAdminId: admin.uid,
        markedByAdminName: admin.name,
        markedDateTime: now,
      });

      const auditRef = db.collection("attendanceAuditLogs").doc();
      batch.set(auditRef, {
        attendanceId: ref.id,
        oldStatus: null,
        newStatus: record.status,
        changedByAdminId: admin.uid,
        changedByAdminName: admin.name,
        changedDateTime: now,
        remarks: record.remarks ?? null,
      });
    }
  }

  await batch.commit();
}

export async function updateAttendance(
  id: string,
  input: { status: AttendanceStatus; remarks?: string },
  admin: { uid: string; name: string }
): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection("attendance").doc(id);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("Attendance record not found");
  }

  const existing = snap.data() as AttendanceRecord;
  const now = new Date();

  const batch = db.batch();
  batch.update(ref, {
    attendanceStatus: input.status,
    remarks: input.remarks || "",
    lastModifiedBy: admin.uid,
    lastModifiedByName: admin.name,
    lastModifiedDateTime: now,
  });

  if (existing.attendanceStatus !== input.status) {
    const auditRef = db.collection("attendanceAuditLogs").doc();
    batch.set(auditRef, {
      attendanceId: id,
      oldStatus: existing.attendanceStatus,
      newStatus: input.status,
      changedByAdminId: admin.uid,
      changedByAdminName: admin.name,
      changedDateTime: now,
      remarks: input.remarks ?? null,
    });
  }

  await batch.commit();
}

export async function getAttendanceBySession(
  itemType: AttendanceRecord["itemType"],
  itemId: string,
  sessionDate: string
): Promise<AttendanceRecord[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("attendance")
    .where("itemType", "==", itemType)
    .where("itemId", "==", itemId)
    .where("sessionDate", "==", sessionDate)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

export async function getAttendanceHistory(options?: {
  limit?: number;
  offset?: number;
  search?: string;
  itemType?: string;
  itemId?: string;
  sessionDate?: string;
  status?: AttendanceStatus;
}): Promise<{ records: AttendanceRecord[]; total: number }> {
  const db = getAdminDb();
  let query: FirebaseFirestore.Query = db.collection("attendance").orderBy("markedDateTime", "desc");

  if (options?.itemType) query = query.where("itemType", "==", options.itemType);
  if (options?.itemId) query = query.where("itemId", "==", options.itemId);
  if (options?.sessionDate) query = query.where("sessionDate", "==", options.sessionDate);
  if (options?.status) query = query.where("attendanceStatus", "==", options.status);

  const snap = await query.get();
  let records = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AttendanceRecord));

  if (options?.search) {
    const term = options.search.toLowerCase();
    records = records.filter(
      (r) =>
        r.userName?.toLowerCase().includes(term) ||
        r.itemName?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term)
    );
  }

  const total = records.length;
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  records = records.slice(offset, offset + limit);

  return { records, total };
}

export async function getAttendanceSummary(
  itemType: AttendanceRecord["itemType"],
  itemId: string,
  sessionDate: string
): Promise<{ total: number; present: number; absent: number; medicalLeave: number; attendancePercentage: number }> {
  const records = await getAttendanceBySession(itemType, itemId, sessionDate);
  const present = records.filter((r) => r.attendanceStatus === "P").length;
  const absent = records.filter((r) => r.attendanceStatus === "A").length;
  const medicalLeave = records.filter((r) => r.attendanceStatus === "ML").length;
  const total = records.length;
  const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent, medicalLeave, attendancePercentage };
}
