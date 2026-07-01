"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { getAllUsers, type FirestoreUserProfile } from "@/lib/db/users";
import { LOGGER } from "@/lib/logger";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdByAdminName: string;
  createdAt: string;
}

interface EmailCampaign {
  id: string;
  subject: string;
  body: string;
  sentByAdminName: string;
  sentAt: string;
  recipientCount: number;
  successCount: number;
  failedCount: number;
  status: "success" | "partial" | "failed";
}

interface EmailRecipient {
  userName: string;
  email: string;
  deliveryStatus: "sent" | "failed";
  errorMessage?: string;
}

type Tab = "send" | "templates" | "history";

const TABS: { value: Tab; label: string }[] = [
  { value: "send", label: "Send Email" },
  { value: "templates", label: "Templates" },
  { value: "history", label: "History" },
];

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

export default function AdminNotificationsPage() {
  const { firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("send");

  // Users
  const [users, setUsers] = useState<FirestoreUserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // History
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");

  // Send form
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals
  const [viewingCampaign, setViewingCampaign] = useState<EmailCampaign | null>(null);
  const [campaignRecipients, setCampaignRecipients] = useState<EmailRecipient[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Template modal
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");

  useEffect(() => {
    loadUsers();
    loadTemplates();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      LOGGER.error("Failed to load users", { error: String(e) });
      showMessage("Failed to load users", "error");
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadTemplates() {
    setTemplatesLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch("/api/admin/email-templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTemplates(data.templates || []);
    } catch (e) {
      LOGGER.error("Failed to load templates", { error: String(e) });
    } finally {
      setTemplatesLoading(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      if (historySearch) params.set("search", historySearch);
      if (historyStatus) params.set("status", historyStatus);
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`/api/admin/emails/history?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCampaigns(data.campaigns || []);
    } catch (e) {
      LOGGER.error("Failed to load email history", { error: String(e) });
    } finally {
      setHistoryLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const term = userSearch.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term);
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  const allFilteredSelected = useMemo(() => {
    return filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.has(u.uid));
  }, [filteredUsers, selectedUserIds]);

  function toggleUser(uid: string) {
    const next = new Set(selectedUserIds);
    if (next.has(uid)) next.delete(uid);
    else next.add(uid);
    setSelectedUserIds(next);
  }

  function toggleSelectAllFiltered() {
    const next = new Set(selectedUserIds);
    if (allFilteredSelected) {
      for (const u of filteredUsers) next.delete(u.uid);
    } else {
      for (const u of filteredUsers) next.add(u.uid);
    }
    setSelectedUserIds(next);
  }

  function applyTemplate(id: string) {
    setSelectedTemplateId(id);
    if (!id) return;
    const t = templates.find((x) => x.id === id);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
  }

  function renderPreview(html: string): string {
    return html.replace(/\{\{UserName\}\}/g, "Sample Member");
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      showMessage("Subject and body are required", "error");
      return;
    }
    if (selectedUserIds.size === 0) {
      showMessage("Please select at least one recipient", "error");
      return;
    }
    setShowConfirm(true);
  }

  async function confirmSend() {
    setShowConfirm(false);
    setSendLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          body,
          userIds: Array.from(selectedUserIds),
          templateId: selectedTemplateId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send emails");
      showMessage(
        `Email sent to ${data.successCount} of ${data.recipientCount} recipients`,
        data.failedCount > 0 ? "error" : "success"
      );
      setSelectedUserIds(new Set());
      loadHistory();
      setActiveTab("history");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to send emails", "error");
    } finally {
      setSendLoading(false);
    }
  }

  async function viewCampaignDetails(campaign: EmailCampaign) {
    setViewingCampaign(campaign);
    setDetailsLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`/api/admin/emails/history/${campaign.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCampaignRecipients(data.recipients || []);
    } catch (e) {
      LOGGER.error("Failed to load campaign details", { error: String(e) });
    } finally {
      setDetailsLoading(false);
    }
  }

  function openTemplateModal(template?: EmailTemplate) {
    if (template) {
      setEditingTemplate(template);
      setTemplateName(template.name);
      setTemplateSubject(template.subject);
      setTemplateBody(template.body);
    } else {
      setEditingTemplate(null);
      setTemplateName("");
      setTemplateSubject("");
      setTemplateBody("");
    }
    setTemplateModalOpen(true);
  }

  async function saveTemplate() {
    if (!templateName.trim() || !templateSubject.trim() || !templateBody.trim()) {
      showMessage("Name, subject and body are required", "error");
      return;
    }
    try {
      const token = await firebaseUser?.getIdToken();
      const url = editingTemplate
        ? `/api/admin/email-templates/${editingTemplate.id}`
        : "/api/admin/email-templates";
      const method = editingTemplate ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: templateName.trim(),
          subject: templateSubject.trim(),
          body: templateBody.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template");
      showMessage(editingTemplate ? "Template updated" : "Template created", "success");
      setTemplateModalOpen(false);
      loadTemplates();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to save template", "error");
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`/api/admin/email-templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete template");
      showMessage("Template deleted", "success");
      loadTemplates();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to delete template", "error");
    }
  }

  return (
    <AdminShell title="Notifications" subtitle="Send emails, manage templates, and view history">
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

      {activeTab === "send" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="mb-4 font-serif text-xl font-bold text-tattvam-purple-900">Compose Email</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Load Template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="">— Select a template —</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Body (HTML)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  placeholder="Enter email body. Use {{UserName}} for the recipient's name."
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm font-mono focus:border-tattvam-purple-400 focus:outline-none"
                />
                <p className="mt-1 text-xs text-tattvam-purple-500">
                  Use <code className="rounded bg-tattvam-purple-100 px-1">{"{{UserName}}"}</code> to insert the
                  recipient&apos;s name.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-tattvam-purple-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-tattvam-purple-800">Preview</h3>
              <div className="rounded-lg bg-white p-4 text-sm text-tattvam-purple-700">
                <p className="font-semibold">{renderPreview(subject) || "[No subject]"}</p>
                <div
                  className="mt-2 max-h-40 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: renderPreview(body) || "<p>[No body]</p>" }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">
                Select Recipients ({selectedUserIds.size} selected)
              </h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                >
                  <option value="">All roles</option>
                  <option value="learner">Learner</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="coach">Coach</option>
                </select>
              </div>
            </div>

            {usersLoading ? (
              <div className="py-12 text-center text-tattvam-purple-400">Loading users...</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-tattvam-purple-50">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleSelectAllFiltered}
                          className="h-4 w-4 rounded border-tattvam-purple-300 text-tattvam-purple-600"
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Name</th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Email</th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Phone</th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.uid}
                        className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.has(u.uid)}
                            onChange={() => toggleUser(u.uid)}
                            className="h-4 w-4 rounded border-tattvam-purple-300 text-tattvam-purple-600"
                          />
                        </td>
                        <td className="px-4 py-3 text-tattvam-purple-800">{u.name}</td>
                        <td className="px-4 py-3 text-tattvam-purple-600">{u.email}</td>
                        <td className="px-4 py-3 text-tattvam-purple-600">{u.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-tattvam-purple-100 px-2.5 py-1 text-xs font-medium text-tattvam-purple-700">
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-tattvam-purple-400">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSend}
                disabled={sendLoading || !subject.trim() || !body.trim() || selectedUserIds.size === 0}
                className="btn-primary text-sm disabled:opacity-60"
              >
                {sendLoading ? "Sending…" : `Send Email to ${selectedUserIds.size} Recipient${selectedUserIds.size !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Email Templates</h2>
            <button onClick={() => openTemplateModal()} className="btn-primary text-sm">
              ➕ Add Template
            </button>
          </div>

          {templatesLoading ? (
            <div className="py-12 text-center text-tattvam-purple-400">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="py-12 text-center text-tattvam-purple-400">
              No templates yet. Create one to reuse later.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-tattvam-purple-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Name</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Subject</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Created</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
                    >
                      <td className="px-6 py-4 font-medium text-tattvam-purple-800">{t.name}</td>
                      <td className="px-6 py-4 text-tattvam-purple-600">{t.subject}</td>
                      <td className="px-6 py-4 text-tattvam-purple-600">{formatDate(t.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openTemplateModal(t)}
                            className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTemplate(t.id)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
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
            <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">Email History</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="Search subject..."
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
                <option value="success">Success</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
              </select>
              <button onClick={loadHistory} className="btn-primary text-sm">
                Search
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="py-12 text-center text-tattvam-purple-400">Loading history...</div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center text-tattvam-purple-400">No emails sent yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-tattvam-purple-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Subject</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Sent By</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Sent At</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Recipients</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Status</th>
                    <th className="px-6 py-4 font-semibold text-tattvam-purple-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
                    >
                      <td className="px-6 py-4 font-medium text-tattvam-purple-800">{c.subject}</td>
                      <td className="px-6 py-4 text-tattvam-purple-600">{c.sentByAdminName}</td>
                      <td className="px-6 py-4 text-tattvam-purple-600">{formatDate(c.sentAt)}</td>
                      <td className="px-6 py-4 text-tattvam-purple-600">
                        {c.successCount}/{c.recipientCount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={classNames(
                            "rounded-full px-3 py-1 text-xs font-bold",
                            c.status === "success" && "bg-green-100 text-green-700",
                            c.status === "partial" && "bg-yellow-100 text-yellow-700",
                            c.status === "failed" && "bg-red-100 text-red-700"
                          )}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewCampaignDetails(c)}
                          className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-200"
                        >
                          View Details
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

      {/* Confirm Send Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-tattvam-purple-900">Confirm Send</h3>
            <p className="mt-2 text-sm text-tattvam-purple-600">
              Are you sure you want to send this email to{" "}
              <strong>{selectedUserIds.size}</strong> recipient
              {selectedUserIds.size !== 1 ? "s" : ""}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
              <button onClick={confirmSend} className="btn-primary text-sm">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {viewingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-tattvam-purple-900">{viewingCampaign.subject}</h3>
            <p className="mt-1 text-sm text-tattvam-purple-600">
              Sent by {viewingCampaign.sentByAdminName} on {formatDate(viewingCampaign.sentAt)}
            </p>
            <div className="mt-4 rounded-xl bg-tattvam-purple-50 p-4">
              <div
                className="prose prose-sm max-w-none text-tattvam-purple-700"
                dangerouslySetInnerHTML={{ __html: viewingCampaign.body }}
              />
            </div>
            <h4 className="mb-2 mt-6 font-semibold text-tattvam-purple-800">Recipients</h4>
            {detailsLoading ? (
              <div className="py-8 text-center text-tattvam-purple-400">Loading recipients...</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-tattvam-purple-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-tattvam-purple-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Name</th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Email</th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Status</th>
                      <th className="px-4 py-3 font-semibold text-tattvam-purple-800">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignRecipients.map((r, idx) => (
                      <tr key={idx} className="border-b border-tattvam-purple-50">
                        <td className="px-4 py-3 text-tattvam-purple-800">{r.userName}</td>
                        <td className="px-4 py-3 text-tattvam-purple-600">{r.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={classNames(
                              "rounded-full px-2.5 py-1 text-xs font-bold",
                              r.deliveryStatus === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}
                          >
                            {r.deliveryStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-red-600">{r.errorMessage || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingCampaign(null)}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-tattvam-purple-900">
              {editingTemplate ? "Edit Template" : "Add Template"}
            </h3>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Welcome Email"
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Subject</label>
                <input
                  type="text"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">Body (HTML)</label>
                <textarea
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  rows={10}
                  placeholder="Enter HTML email body. Use {{UserName}} for the recipient's name."
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm font-mono focus:border-tattvam-purple-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={!templateName.trim() || !templateSubject.trim() || !templateBody.trim()}
                className="btn-primary text-sm disabled:opacity-60"
              >
                {editingTemplate ? "Save Changes" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
