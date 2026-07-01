"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { LOGGER } from "@/lib/logger";

interface Session {
  id: string;
  itemType: "workshop" | "consultation";
  itemId: string;
  itemName: string;
  sessionDate: string | null;
  sessionDateDisplay: string;
  registeredCount: number;
}

interface Registration {
  userId: string;
  userName: string;
  email: string;
  attendanceId?: string;
  attendanceStatus?: string;
  remarks?: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  email: string;
  itemType: "workshop" | "consultation";
  itemId: string;
  itemName: string;
  sessionDate: string;
  attendanceStatus: "P" | "A" | "ML";
  remarks?: string;
  markedByAdminName: string;
  markedDateTime: string;
  lastModifiedByName?: string;
  lastModifiedDateTime?: string;
}

type Tab = "mark" | "history" | "report";

const TABS: { value: Tab; label: string }[] = [
  { value: "mark", label: "Mark Attendance" },
  { value: "history", label: "Attendance History" },
  { value: "report", label: "Service-wise Report" },
];

const STATUS_LABELS: Record<string, string> = { P: "Present", A: "Absent", ML: "Medical Leave" };
const STATUS_CLASSES: Record<string, string> = {
  P: "bg-green-100 text-green-700",
  A: "bg-red-100 text-red-700",
  ML: "bg-yellow-100 text-yellow-700",
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(value: string | Date | { seconds?: number; toMillis?: () => number }): string {
  if (!value) return "—";
  let date: Date;
  if (typeof value === "string") {
    date = new Date(value);
  } else if (value instanceof Date) {
    date = value;
  } else if ("toMillis" in value && typeof value.toMillis === "function") {
    date = new Date(value.toMillis());
  } else if ("seconds" in value && typeof value.seconds === "number") {
    date = new Date(value.seconds * 1000);
  } else {
    return "—";
  }
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAttendancePage() {
  const { firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("mark");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Mark attendance state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [markLoading, setMarkLoading] = useState(false);

  // History state
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");

  // Report state
  const [reportSession, setReportSession] = useState<Session | null>(null);
  const [reportSummary, setReportSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    medicalLeave: 0,
    attendancePercentage: 0,
  });
  const [reportRecords, setReportRecords] = useState<AttendanceRecord[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  // Edit modal
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<"P" | "A" | "ML">("P");
  const [editRemarks, setEditRemarks] = useState("");

  useEffect(() => {
    loadSessions();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  async function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
    const token = await firebaseUser?.getIdToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function loadSessions() {
    setSessionsLoading(true);
    try {
      const res = await fetchWithAuth("/api/admin/attendance/sessions");
      const data = await res.json();
      if (res.ok) setSessions(data.sessions || []);
    } catch (e) {
      LOGGER.error("Failed to load attendance sessions", { error: String(e) });
      showMessage("Failed to load sessions", "error");
    } finally {
      setSessionsLoading(false);
    }
  }

  async function openMarkSession(session: Session) {
    setSelectedSession(session);
    setMarkLoading(true);
    try {
      const res = await fetchWithAuth(`/api/admin/attendance/sessions/${session.id}/registrations`);
      const data = await res.json();
      if (res.ok) {
        setRegistrations(
          (data.registrations || []).map((r: Registration) => ({
            ...r,
            attendanceStatus: r.attendanceStatus || "",
            remarks: r.remarks || "",
          }))
        );
      }
    } catch (e) {
      LOGGER.error("Failed to load registrations", { error: String(e) });
      showMessage("Failed to load registrations", "error");
    } finally {
      setMarkLoading(false);
    }
  }

  function updateRegistrationStatus(userId: string, status: string) {
    setRegistrations((prev) =>
      prev.map((r) => (r.userId === userId ? { ...r, attendanceStatus: status } : r))
    );
  }

  function updateRegistrationRemarks(userId: string, remarks: string) {
    setRegistrations((prev) =>
      prev.map((r) => (r.userId === userId ? { ...r, remarks } : r))
    );
  }

  function markAll(status: string) {
    setRegistrations((prev) => prev.map((r) => ({ ...r, attendanceStatus: status })));
  }

  async function saveAttendance() {
    if (!selectedSession) return;
    const recordsToSave = registrations.filter((r) => r.attendanceStatus);
    if (recordsToSave.length === 0) {
      showMessage("Please mark status for at least one participant", "error");
      return;
    }

    setMarkLoading(true);
    try {
      const res = await fetchWithAuth(`/api/admin/attendance/sessions/${selectedSession.id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: recordsToSave.map((r) => ({
            userId: r.userId,
            userName: r.userName,
            email: r.email,
            status: r.attendanceStatus,
            remarks: r.remarks,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save attendance");
      showMessage("Attendance saved successfully", "success");
      setSelectedSession(null);
      loadHistory();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to save attendance", "error");
    } finally {
      setMarkLoading(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      if (historySearch) params.set("search", historySearch);
      if (historyStatus) params.set("status", historyStatus);
      const res = await fetchWithAuth(`/api/admin/attendance?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setHistoryRecords(data.records || []);
    } catch (e) {
      LOGGER.error("Failed to load attendance history", { error: String(e) });
    } finally {
      setHistoryLoading(false);
    }
  }

  function openEdit(record: AttendanceRecord) {
    setEditingRecord(record);
    setEditStatus(record.attendanceStatus);
    setEditRemarks(record.remarks || "");
  }

  async function saveEdit() {
    if (!editingRecord) return;
    try {
      const res = await fetchWithAuth(`/api/admin/attendance/${editingRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, remarks: editRemarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update attendance");
      showMessage("Attendance updated", "success");
      setEditingRecord(null);
      loadHistory();
      if (reportSession) loadReport(reportSession);
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to update attendance", "error");
    }
  }

  async function loadReport(session: Session) {
    setReportSession(session);
    setReportLoading(true);
    try {
      const date = session.sessionDate || "";
      const [summaryRes, historyRes] = await Promise.all([
        fetchWithAuth(
          `/api/admin/attendance/summary?itemType=${session.itemType}&itemId=${session.itemId}&sessionDate=${date}`
        ),
        fetchWithAuth(
          `/api/admin/attendance?itemType=${session.itemType}&itemId=${session.itemId}&sessionDate=${date}&limit=1000`
        ),
      ]);
      const summaryData = await summaryRes.json();
      const historyData = await historyRes.json();
      if (summaryRes.ok) setReportSummary(summaryData);
      if (historyRes.ok) setReportRecords(historyData.records || []);
    } catch (e) {
      LOGGER.error("Failed to load report", { error: String(e) });
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <AdminShell title="Attendance" subtitle="Mark and review attendance for workshops and consultations">
      {message && (
        <div
          className={classNames(
            "mb-4 rounded-xl px-5 py-3 text-sm font-medium",
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6 flex space-x-1 rounded-xl bg-white p-1 shadow-soft">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={classNames(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition",
              activeTab === tab.value
                ? "bg-tattvam-purple-600 text-white"
                : "text-tattvam-purple-600 hover:bg-tattvam-purple-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "mark" && (
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-serif text-xl font-bold text-tattvam-purple-900">Upcoming Sessions</h2>
          {sessionsLoading ? (
            <div className="py-12 text-center text-tattvam-purple-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center text-tattvam-purple-400">No upcoming sessions found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-tattvam-purple-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Name</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Type</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Date</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Registered</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50">
                      <td className="px-6 py-4 font-medium text-tattvam-purple-800">{s.itemName}</td>
                      <td className="px-6 py-4 text-tattvam-purple-600 capitalize">{s.itemType}</td>
                      <td className="px-6 py-4 text-tattvam-purple-600">{s.sessionDateDisplay}</td>
                      <td className="px-6 py-4 text-tattvam-purple-600">{s.registeredCount}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openMarkSession(s)}
                          className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-200"
                        >
                          Mark Attendance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Attendance History</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="Search user or session..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
              />
              <select
                value={historyStatus}
                onChange={(e) => setHistoryStatus(e.target.value)}
                className="rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
              >
                <option value="">All statuses</option>
                <option value="P">Present</option>
                <option value="A">Absent</option>
                <option value="ML">Medical Leave</option>
              </select>
              <button onClick={loadHistory} className="btn-primary text-sm">
                Search
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="py-12 text-center text-tattvam-purple-400">Loading history...</div>
          ) : historyRecords.length === 0 ? (
            <div className="py-12 text-center text-tattvam-purple-400">No attendance records found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
              <table className="w-full min-w-[768px] text-left text-sm">
                <thead className="bg-tattvam-purple-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Session</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Date</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">User</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Status</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Last Updated</th>
                    <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.map((r) => (
                    <tr key={r.id} className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50">
                      <td className="px-4 py-3 font-medium text-tattvam-purple-800">{r.itemName}</td>
                      <td className="px-4 py-3 text-tattvam-purple-600">{r.sessionDate || "—"}</td>
                      <td className="px-4 py-3 text-tattvam-purple-600">
                        {r.userName}
                        <br />
                        <span className="text-xs text-tattvam-purple-400">{r.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={classNames(
                            "rounded-full px-2.5 py-1 text-xs font-bold",
                            STATUS_CLASSES[r.attendanceStatus]
                          )}
                        >
                          {STATUS_LABELS[r.attendanceStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-tattvam-purple-600">
                        {r.lastModifiedByName || r.markedByAdminName}
                        <br />
                        {formatDate(r.lastModifiedDateTime || r.markedDateTime)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(r)}
                          className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-200"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "report" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="mb-4 font-serif text-xl font-bold text-tattvam-purple-900">Service-wise Report</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <select
                value={reportSession?.id || ""}
                onChange={(e) => {
                  const s = sessions.find((x) => x.id === e.target.value);
                  if (s) loadReport(s);
                }}
                className="flex-1 rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
              >
                <option value="">Select a session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.itemName} — {s.sessionDateDisplay}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {reportSession && (
            <div className="rounded-2xl bg-white p-6 shadow-soft">
              {reportLoading ? (
                <div className="py-12 text-center text-tattvam-purple-400">Loading report...</div>
              ) : (
                <>
                  <h3 className="mb-4 font-serif text-lg font-bold text-tattvam-purple-900">
                    {reportSession.itemName} — {reportSession.sessionDateDisplay}
                  </h3>
                  <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      { label: "Total", value: reportSummary.total, color: "text-tattvam-purple-800" },
                      { label: "Present", value: reportSummary.present, color: "text-green-700" },
                      { label: "Absent", value: reportSummary.absent, color: "text-red-700" },
                      { label: "Medical Leave", value: reportSummary.medicalLeave, color: "text-yellow-700" },
                    ].map((card) => (
                      <div key={card.label} className="rounded-xl bg-tattvam-purple-50 p-4 text-center">
                        <p className={classNames("text-2xl font-bold", card.color)}>{card.value}</p>
                        <p className="text-xs text-tattvam-purple-600">{card.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-4 rounded-xl bg-tattvam-purple-100 p-3 text-center text-sm font-medium text-tattvam-purple-800">
                    Attendance Percentage: {reportSummary.attendancePercentage}%
                  </div>

                  {reportRecords.length === 0 ? (
                    <div className="py-8 text-center text-tattvam-purple-400">
                      No attendance marked for this session yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-tattvam-purple-50">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-tattvam-purple-800">User</th>
                            <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Status</th>
                            <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportRecords.map((r) => (
                            <tr key={r.id} className="border-b border-tattvam-purple-50">
                              <td className="px-4 py-3 text-tattvam-purple-800">{r.userName}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={classNames(
                                    "rounded-full px-2.5 py-1 text-xs font-bold",
                                    STATUS_CLASSES[r.attendanceStatus]
                                  )}
                                >
                                  {STATUS_LABELS[r.attendanceStatus]}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-tattvam-purple-600">{r.remarks || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mark Attendance Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-tattvam-purple-900">
              Mark Attendance — {selectedSession.itemName}
            </h3>
            <p className="text-sm text-tattvam-purple-600">{selectedSession.sessionDateDisplay}</p>

            <div className="mb-4 mt-4 flex gap-2">
              <button
                onClick={() => markAll("P")}
                className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAll("A")}
                className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
              >
                Mark All Absent
              </button>
            </div>

            {markLoading ? (
              <div className="py-12 text-center text-tattvam-purple-400">Loading participants...</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-tattvam-purple-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Name</th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Email</th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Status</th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.userId} className="border-b border-tattvam-purple-50">
                        <td className="px-4 py-3 text-tattvam-purple-800">{r.userName}</td>
                        <td className="px-4 py-3 text-tattvam-purple-600">{r.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={r.attendanceStatus}
                            onChange={(e) => updateRegistrationStatus(r.userId, e.target.value)}
                            className="rounded-lg border border-tattvam-purple-200 px-2 py-1 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                          >
                            <option value="">—</option>
                            <option value="P">Present</option>
                            <option value="A">Absent</option>
                            <option value="ML">Medical Leave</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={r.remarks}
                            onChange={(e) => updateRegistrationRemarks(r.userId, e.target.value)}
                            placeholder="Optional"
                            className="w-full rounded-lg border border-tattvam-purple-200 px-2 py-1 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedSession(null)}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
              <button
                onClick={saveAttendance}
                disabled={markLoading || registrations.filter((r) => r.attendanceStatus).length === 0}
                className="btn-primary text-sm disabled:opacity-60"
              >
                {markLoading ? "Saving…" : "Save Attendance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-tattvam-purple-900">Edit Attendance</h3>
            <p className="mt-1 text-sm text-tattvam-purple-600">
              {editingRecord.userName} — {editingRecord.itemName}
            </p>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as "P" | "A" | "ML")}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                >
                  <option value="P">Present</option>
                  <option value="A">Absent</option>
                  <option value="ML">Medical Leave</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Remarks</label>
                <input
                  type="text"
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingRecord(null)}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
              <button onClick={saveEdit} className="btn-primary text-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
