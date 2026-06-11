"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getAllUsers,
  updateUserProfile,
  getUserRegistrations,
  type FirestoreUserProfile,
} from "@/lib/db/users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<FirestoreUserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "learner" | "admin" | "super_admin" | "coach">("All");
  const [selectedUser, setSelectedUser] = useState<FirestoreUserProfile | null>(null);
  const [userDetails, setUserDetails] = useState<{
    bookings: { id: string; type: string; title: string; date: string; status: string }[];
    payments: { id: string; itemType: string; itemTitle?: string; amount: number; status: string; createdAt?: string }[];
  } | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      showMessage("Failed to load users. Please refresh.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleRoleChange(uid: string, newRole: FirestoreUserProfile["role"]) {
    try {
      await updateUserProfile(uid, { role: newRole });
      showMessage("Role updated successfully.", "success");
      await loadUsers();
      if (selectedUser?.uid === uid) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (e) {
      console.error(e);
      showMessage("Failed to update role. Please try again.", "error");
    }
  }

  async function viewUserDetails(user: FirestoreUserProfile) {
    setSelectedUser(user);
    setDetailsLoading(true);
    setUserDetails(null);
    try {
      const details = await getUserRegistrations(user.uid);
      setUserDetails(details);
    } catch (e) {
      console.error(e);
      showMessage("Failed to load user details.", "error");
    } finally {
      setDetailsLoading(false);
    }
  }

  function exportToCSV() {
    const headers = ["user_id", "name", "email", "phone", "role", "signup_date", "last_active"];
    const rows = filteredUsers.map((u) => [
      u.uid,
      u.name,
      u.email,
      u.phone || "",
      u.role,
      u.createdAt ? new Date(u.createdAt.toDate()).toISOString() : "",
      u.updatedAt ? new Date(u.updatedAt.toDate()).toISOString() : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage("CSV exported successfully.", "success");
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").includes(search);
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminShell title="User Management" subtitle="View, manage, and export all registered users">
      {/* Message Toast */}
      {message && (
        <div
          className={`mb-4 rounded-xl px-5 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportToCSV} className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50">
            📤 Export CSV
          </button>
          <span className="text-sm text-tattvam-purple-500">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="rounded-full border border-tattvam-purple-200 bg-white px-4 py-3 text-sm text-tattvam-purple-800 focus:border-tattvam-purple-400 focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="learner">Learner</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="coach">Coach</option>
          </select>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading users...</div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-400">No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-50">
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Phone</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Joined</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.uid}
                  className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-tattvam-purple-800">{user.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">{user.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.role === "super_admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "admin"
                          ? "bg-amber-100 text-amber-700"
                          : user.role === "coach"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                    {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200"
                      >
                        View
                      </button>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as FirestoreUserProfile["role"])}
                        className="rounded-lg border border-tattvam-purple-200 bg-white px-2 py-1.5 text-xs text-tattvam-purple-700 focus:border-tattvam-purple-400 focus:outline-none"
                      >
                        <option value="learner">Learner</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="coach">Coach</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">{selectedUser.name}</h2>
                <p className="text-sm text-tattvam-purple-600">{selectedUser.email}</p>
                {selectedUser.phone && <p className="text-sm text-tattvam-purple-500">{selectedUser.phone}</p>}
              </div>
              <button
                onClick={() => { setSelectedUser(null); setUserDetails(null); }}
                className="rounded-lg border border-tattvam-purple-200 px-3 py-1.5 text-sm text-tattvam-purple-600 hover:bg-tattvam-purple-50"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  selectedUser.role === "super_admin"
                    ? "bg-purple-100 text-purple-700"
                    : selectedUser.role === "admin"
                    ? "bg-amber-100 text-amber-700"
                    : selectedUser.role === "coach"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {selectedUser.role}
              </span>
              <span className="text-xs text-tattvam-purple-500">
                Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt.toDate()).toLocaleDateString() : "—"}
              </span>
            </div>

            {detailsLoading ? (
              <div className="mt-6 flex h-32 items-center justify-center">
                <div className="text-tattvam-purple-400">Loading details...</div>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* Bookings */}
                <div>
                  <h3 className="font-semibold text-tattvam-purple-800">1:1 Consultations</h3>
                  {userDetails && userDetails.bookings.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {userDetails.bookings.map((b) => (
                        <div key={b.id} className="rounded-xl bg-tattvam-purple-50 p-3">
                          <p className="text-sm font-medium text-tattvam-purple-800">{b.title}</p>
                          <p className="text-xs text-tattvam-purple-600">{b.date}</p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                              b.status === "upcoming"
                                ? "bg-amber-100 text-amber-700"
                                : b.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-tattvam-purple-400">No consultations found.</p>
                  )}
                </div>

                {/* Payments */}
                <div>
                  <h3 className="font-semibold text-tattvam-purple-800">Payments & Enrollments</h3>
                  {userDetails && userDetails.payments.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {userDetails.payments.map((p) => (
                        <div key={p.id} className="rounded-xl bg-tattvam-purple-50 p-3">
                          <p className="text-sm font-medium text-tattvam-purple-800">
                            {p.itemTitle || p.itemType} — ₹{p.amount / 100}
                          </p>
                          <p className="text-xs text-tattvam-purple-600">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}
                          </p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                              p.status === "captured"
                                ? "bg-green-100 text-green-700"
                                : p.status === "created"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-tattvam-purple-400">No payments found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
