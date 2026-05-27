import Image from "next/image";
import Link from "next/link";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

const navItems = [
  { href: "/feeds", label: "Feeds" },
  { href: "/services", label: "Services" },
  { href: "/workshops", label: "Workshops" },
  { href: "/courses", label: "Courses" },
  { href: "/booking", label: "1:1 Booking" }
] as const;

/**
 * Primary navigation shared across learner app pages.
 * Note: Landing page has its own custom nav, this is for inner app pages.
 */
export function Navigation() {
  return (
    <header className="sticky top-0 z-10 border-b border-tattvam-purple-100 bg-tattvam-neutral-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center font-semibold text-tattvam-purple-700">
          <div className="relative h-16 w-52">
            <Image
              src="/assets/homepage/logo.png"
              alt="Tattvam Niramaya"
              fill
              className="object-cover"
            />
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-tattvam-purple-100 bg-white/60 px-4 py-2 text-sm font-medium text-tattvam-purple-600 transition hover:border-tattvam-purple-300 hover:bg-white hover:text-tattvam-purple-800"
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
