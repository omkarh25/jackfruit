"use client";

import { useEffect, useState, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type TestimonialRecord,
} from "@/lib/db/testimonials";
import { uploadFile } from "@/lib/storage";

const emptyTestimonial: Omit<TestimonialRecord, "id" | "createdAt" | "updatedAt"> = {
  type: "text",
  name: "",
  role: "",
  quote: "",
  mediaUrl: "",
  isFeatured: false,
  isApproved: true,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialRecord | null>(null);
  const [form, setForm] = useState(emptyTestimonial);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await getAllTestimonials();
      setTestimonials(data);
    } catch (e) {
      console.error(e);
      showMessage("Failed to load testimonials.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyTestimonial);
    setIsModalOpen(true);
  }

  function openEdit(t: TestimonialRecord) {
    setEditing(t);
    setForm({
      type: t.type,
      name: t.name,
      role: t.role,
      quote: t.quote || "",
      mediaUrl: t.mediaUrl || "",
      isFeatured: t.isFeatured,
      isApproved: t.isApproved,
    });
    setIsModalOpen(true);
  }

  const MAX_FILE_SIZE_MB = 20;

  function sanitizeFileName(name: string): string {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showMessage(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`, "error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const safeName = sanitizeFileName(file.name);
      const path = `testimonials/${Date.now()}_${safeName}`;
      const url = await uploadFile(file, path, setUploadProgress);
      setForm((f) => ({ ...f, mediaUrl: url }));
      showMessage("File uploaded successfully.", "success");
    } catch (err) {
      console.error(err);
      showMessage(err instanceof Error ? err.message : "Failed to upload file.", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showMessage("Please enter the person's name.", "error");
      return;
    }
    if (!form.role.trim()) {
      showMessage("Please enter the designation.", "error");
      return;
    }
    if (form.type === "text" && !form.quote?.trim()) {
      showMessage("Please enter the testimonial text.", "error");
      return;
    }
    if ((form.type === "video" || form.type === "image") && !form.mediaUrl?.trim()) {
      showMessage("Please upload a file or provide a media URL.", "error");
      return;
    }
    try {
      if (editing?.id) {
        await updateTestimonial(editing.id, form);
        showMessage("Testimonial updated successfully.", "success");
      } else {
        await createTestimonial(form);
        showMessage("Testimonial created successfully.", "success");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to save testimonial.", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      showMessage("Testimonial deleted successfully.", "success");
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to delete testimonial.", "error");
    }
  }

  async function toggleField(id: string, field: "isFeatured" | "isApproved", value: boolean) {
    try {
      await updateTestimonial(id, { [field]: value });
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to update.", "error");
    }
  }

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      (t.quote || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Testimonials" subtitle="Manage client testimonials and reviews">
      {/* Message Toast */}
      {message && (
        <div
          className={`mb-4 rounded-xl px-5 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={openAdd} className="btn-primary text-sm">
            ➕ Add Testimonial
          </button>
          <span className="text-sm text-tattvam-purple-500">
            {filtered.length} testimonial{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search testimonials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading testimonials...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-400">No testimonials found.</p>
          <p className="mt-2 text-sm text-tattvam-purple-500">Add testimonials using the button above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-50">
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Preview</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50">
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-tattvam-purple-100 px-3 py-1 text-xs font-bold text-tattvam-purple-600 capitalize">
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-tattvam-purple-800">{t.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">{t.role}</td>
                  <td className="px-6 py-4">
                    {t.type === "text" ? (
                      <p className="max-w-xs truncate text-sm text-tattvam-purple-600">{t.quote}</p>
                    ) : t.type === "image" ? (
                      t.mediaUrl ? (
                        <img src={t.mediaUrl} alt={t.name} className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <span className="text-sm text-tattvam-purple-400">No image</span>
                      )
                    ) : t.type === "video" ? (
                      t.mediaUrl ? (
                        <span className="text-sm text-tattvam-purple-600">Video uploaded</span>
                      ) : (
                        <span className="text-sm text-tattvam-purple-400">No video</span>
                      )
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleField(t.id!, "isApproved", !t.isApproved)}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          t.isApproved ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.isApproved ? "Approved" : "Pending"}
                      </button>
                      <button
                        onClick={() => toggleField(t.id!, "isFeatured", !t.isFeatured)}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          t.isFeatured ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.isFeatured ? "Featured" : "Not Featured"}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id!)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
              {editing ? "Edit Testimonial" : "Add Testimonial"}
            </h2>
            <div className="mt-6 grid gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as TestimonialRecord["type"] })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {form.type === "text" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Testimonial <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.quote}
                    onChange={(e) => setForm({ ...form, quote: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              )}

              {(form.type === "image" || form.type === "video") && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Upload {form.type === "image" ? "Image" : "Video"}
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={form.type === "image" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-tattvam-purple-100 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-tattvam-purple-700 hover:file:bg-tattvam-purple-200"
                  />
                  {uploading && (
                    <p className="mt-1 text-xs text-tattvam-purple-500">
                      Uploading… {Math.round(uploadProgress * 100)}%
                    </p>
                  )}
                  {form.mediaUrl && (
                    <div className="mt-2">
                      {form.type === "image" ? (
                        <img src={form.mediaUrl} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
                      ) : (
                        <video src={form.mediaUrl} className="h-24 rounded-lg" preload="metadata" />
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-tattvam-purple-400">Or enter a URL below:</p>
                  <input
                    type="url"
                    value={form.mediaUrl || ""}
                    onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                    placeholder={`https://...${form.type === "image" ? ".jpg" : ".mp4"}`}
                    className="mt-1 w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="isApproved"
                    type="checkbox"
                    checked={form.isApproved}
                    onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
                    className="h-4 w-4 rounded border-tattvam-purple-300 text-tattvam-purple-600"
                  />
                  <label htmlFor="isApproved" className="text-sm text-tattvam-purple-700">
                    Approved
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isFeatured"
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-tattvam-purple-300 text-tattvam-purple-600"
                  />
                  <label htmlFor="isFeatured" className="text-sm text-tattvam-purple-700">
                    Featured
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary text-sm" disabled={uploading}>
                {editing ? "Save Changes" : "Create Testimonial"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
