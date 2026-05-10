"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/workshops", label: "Workshops", icon: "🎓" },
  { href: "/admin/services", label: "Services", icon: "✨" },
  { href: "/admin/consultations", label: "1:1 Consultations", icon: "📅" },
  { href: "/admin/courses", label: "Courses", icon: "📚" },
  { href: "/admin/payments", label: "Payments", icon: "💰" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/content", label: "Content CMS", icon: "📝" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "💬" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
  { href: "/admin/offers", label: "Offers & Coupons", icon: "🎁" },
  { href: "/admin/media", label: "Media Library", icon: "🖼️" },
  { href: "/admin/seed", label: "🔧 Seed Data", icon: "🌱" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-tattvam-purple-800 bg-tattvam-purple-900 text-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-tattvam-purple-800 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tattvam-gold-400 text-lg font-bold text-tattvam-purple-900">
            TN
          </div>
          <div>
            <p className="font-serif font-semibold">Tattvam Niramaya</p>
            <p className="text-xs text-tattvam-purple-400">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-tattvam-gold-400/20 text-tattvam-gold-300 font-medium"
                        : "text-tattvam-purple-300 hover:bg-tattvam-purple-800 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-tattvam-purple-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tattvam-purple-700 text-xs">
              👤
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-tattvam-purple-400">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
