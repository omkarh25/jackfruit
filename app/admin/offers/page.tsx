"use client";

import { useEffect, useMemo, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type CouponRecord,
} from "@/lib/db/coupons";
import { getVisibleServices, type ServiceRecord } from "@/lib/db/services";
import { getAllWorkshops, type WorkshopRecord } from "@/lib/db/workshops";
import { getPublishedCourses, type CourseRecord } from "@/lib/db/courses";

interface ApplicableOption {
  value: string;
  label: string;
}

const GENERIC_OPTIONS: ApplicableOption[] = [
  { value: "consultation", label: "1:1 Consultation" },
  { value: "FLOW", label: "Membership: Ananda Flow" },
  { value: "RISE", label: "Membership: Ananda Rise" },
  { value: "INNER CIRCLE", label: "Membership: Ananda Inner Circle" },
];

function toDateInputValue(ts: CouponRecord["expiryDate"]): string {
  if (!ts) return "";
  const ms = "toMillis" in ts ? ts.toMillis() : new Date(ts as unknown as string | number).getTime();
  const date = new Date(ms);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value: string): Timestamp | undefined {
  if (!value) return undefined;
  // Set expiry to end of the selected day.
  const date = new Date(`${value}T23:59:59.999`);
  return Timestamp.fromDate(date);
}

export default function AdminOffersPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");

  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<CouponRecord["discountType"]>("percentage");
  const [applicableItem, setApplicableItem] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const applicableOptions: ApplicableOption[] = useMemo(() => {
    const activeServices = services
      .filter((s) => s.isVisible)
      .map((s) => ({ value: s.id!, label: `Service: ${s.title}` }));

    const activeWorkshops = workshops
      .filter((w) => w.status !== "archived" && w.registrationsEnabled !== false)
      .map((w) => ({ value: w.id!, label: `Workshop: ${w.title}` }));

    const activeCourses = courses
      .filter((c) => c.isPublished)
      .map((c) => ({ value: c.id!, label: `Course: ${c.title}` }));

    return [...GENERIC_OPTIONS, ...activeServices, ...activeWorkshops, ...activeCourses];
  }, [services, workshops, courses]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [couponData, serviceData, workshopData, courseData] = await Promise.all([
        getAllCoupons(),
        getVisibleServices(),
        getAllWorkshops(),
        getPublishedCourses(),
      ]);
      setCoupons(couponData);
      setServices(serviceData);
      setWorkshops(workshopData);
      setCourses(courseData);
    } catch (e) {
      console.error(e);
      showMessage("Failed to load offers. Please refresh.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  function resetForm() {
    setCode("");
    setDiscountValue(0);
    setDiscountType("percentage");
    setApplicableItem("");
    setExpiryDate("");
    setUsageLimit(0);
    setIsActive(true);
  }

  function openAdd() {
    setEditingCoupon(null);
    resetForm();
    setIsModalOpen(true);
  }

  function openEdit(coupon: CouponRecord) {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountValue(coupon.discountValue);
    setDiscountType(coupon.discountType);
    setApplicableItem(coupon.applicableItems?.[0] ?? "");
    setExpiryDate(toDateInputValue(coupon.expiryDate));
    setUsageLimit(coupon.usageLimit ?? 0);
    setIsActive(coupon.isActive);
    setIsModalOpen(true);
  }

  function validateForm(): string | null {
    if (!code.trim()) return "Please enter a coupon code.";
    if (!/^[A-Z0-9_-]+$/i.test(code.trim())) return "Coupon code can only contain letters, numbers, hyphens and underscores.";
    if (discountValue <= 0) return "Please enter a valid discount value.";
    if (discountType === "percentage" && discountValue > 100) return "Percentage discount cannot exceed 100%.";
    if (!applicableItem) return "Please select an applicable item.";
    return null;
  }

  async function handleSave() {
    const error = validateForm();
    if (error) {
      showMessage(error, "error");
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      applicableItems: [applicableItem],
      expiryDate: fromDateInputValue(expiryDate),
      usageLimit,
      isActive,
    };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.code, {
          ...payload,
          code: editingCoupon.code,
        });
        showMessage("Coupon updated successfully.", "success");
      } else {
        await createCoupon(payload);
        showMessage("Coupon created successfully.", "success");
      }
      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to save coupon. Please try again.", "error");
    }
  }

  async function handleDelete(coupon: CouponRecord) {
    if (!confirm(`Are you sure you want to delete coupon ${coupon.code}? This cannot be undone.`)) return;
    try {
      await deleteCoupon(coupon.code);
      showMessage("Coupon deleted successfully.", "success");
      await loadData();
    } catch (e) {
      console.error(e);
      showMessage("Failed to delete coupon. Please try again.", "error");
    }
  }

  function getApplicableLabel(value: string): string {
    const option = applicableOptions.find((o) => o.value === value);
    return option?.label ?? value;
  }

  function formatExpiry(coupon: CouponRecord): string {
    if (!coupon.expiryDate) return "No expiry";
    const ms = "toMillis" in coupon.expiryDate
      ? coupon.expiryDate.toMillis()
      : new Date(coupon.expiryDate as unknown as string | number).getTime();
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Offers & Coupons" subtitle="Create discount codes and promotions">
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
        <button onClick={openAdd} className="btn-primary text-sm">
          ➕ Add New Coupon
        </button>
        <input
          type="text"
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-full border border-tattvam-purple-200 bg-white px-5 py-3 text-sm text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading coupons...</div>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg text-tattvam-purple-400">No coupons found.</p>
          <p className="mt-2 text-sm text-tattvam-purple-400">Create coupons using the button above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-tattvam-purple-100 bg-tattvam-purple-50">
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Code</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Discount</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Applicable Item</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Expiry</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-tattvam-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-tattvam-purple-50 transition hover:bg-tattvam-purple-50/50"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold uppercase text-tattvam-purple-800">{coupon.code}</p>
                    {coupon.usageLimit > 0 && (
                      <p className="text-xs text-tattvam-purple-500">
                        Used {coupon.usageCount ?? 0} / {coupon.usageLimit}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                    {coupon.discountValue}
                    {coupon.discountType === "percentage" ? "%" : " off"}
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">
                    {getApplicableLabel(coupon.applicableItems?.[0] ?? "")}
                  </td>
                  <td className="px-6 py-4 text-sm text-tattvam-purple-600">{formatExpiry(coupon)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        coupon.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(coupon)}
                        className="rounded-lg bg-tattvam-purple-100 px-3 py-1.5 text-xs font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon)}
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
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h2>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={!!editingCoupon}
                  placeholder="e.g. ANANDA20"
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm uppercase text-tattvam-purple-800 placeholder:text-tattvam-purple-400 focus:border-tattvam-purple-400 focus:outline-none disabled:bg-tattvam-purple-50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as CouponRecord["discountType"])}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                  Applicable Item <span className="text-red-500">*</span>
                </label>
                <select
                  value={applicableItem}
                  onChange={(e) => setApplicableItem(e.target.value)}
                  className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                >
                  <option value="">Select an item</option>
                  {applicableOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-tattvam-purple-700">
                    Usage Limit (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={usageLimit || ""}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-tattvam-purple-200 px-4 py-2 text-sm focus:border-tattvam-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-tattvam-purple-300 text-tattvam-purple-600"
                />
                <label htmlFor="isActive" className="text-sm text-tattvam-purple-700">
                  Active
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-tattvam-purple-200 px-5 py-2.5 text-sm font-medium text-tattvam-purple-600 transition hover:bg-tattvam-purple-50"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary text-sm">
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
