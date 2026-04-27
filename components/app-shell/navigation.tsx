import Link from "next/link";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/feeds", label: "Feeds" },
  { href: "/services", label: "Services" },
  { href: "/workshops", label: "Workshops" },
  { href: "/courses", label: "Courses" },
  { href: "/booking", label: "1:1 Booking" }
] as const;

/**
 * Primary navigation shared across learner pages.
 */
export function Navigation() {
  return (
    <header className="sticky top-0 z-10 border-b border-jackfruit-deep/10 bg-jackfruit-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold text-jackfruit-deep">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-jackfruit-gold text-xl">✦</span>
          <span>
            Jackfruit
            <span className="block text-xs font-medium uppercase tracking-[0.25em] text-jackfruit-leaf">
              Tatvam Niramaya
            </span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-jackfruit-deep/10 bg-white/60 px-4 py-2 text-sm font-medium text-jackfruit-deep transition hover:border-jackfruit-leaf hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <GoogleLoginButton />
        </div>
      </nav>
    </header>
  );
}