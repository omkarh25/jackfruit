import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminOffersPage() {
  return (
    <AdminShell
      title="Offers & Coupons"
      subtitle="Create discount codes and promotions"
    >
      <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
        <p className="text-4xl mb-4">🎁</p>
        <h2 className="font-serif text-2xl font-bold text-tattvam-purple-900">Offers, Coupons & Promotions</h2>
        <p className="mt-4 text-tattvam-purple-600/70 max-w-xl mx-auto">
          Create discount codes with % or flat discounts. Set expiry dates, usage limits, 
          and apply to specific services or workshops.
        </p>
        <button className="btn-primary mt-6 text-sm">Coming Soon</button>
      </div>
    </AdminShell>
  );
}
