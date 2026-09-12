"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "This week" },
  { href: "/weeks", label: "Weeks" },
  { href: "/wife", label: "Wife" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    // Full-width bar on phones (thumb reach); a centred pill once there's
    // room, so a desktop window doesn't get a stretched phone chrome.
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:inset-x-auto sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:rounded-full sm:border sm:pb-0 sm:shadow-xl sm:shadow-black/40">
      <div className="mx-auto grid max-w-lg grid-cols-3 sm:flex sm:gap-1 sm:px-2">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-3.5 text-center text-sm font-medium sm:rounded-full sm:px-5 sm:py-2.5 ${
                active ? "text-accent sm:bg-accent/10" : "text-muted"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
