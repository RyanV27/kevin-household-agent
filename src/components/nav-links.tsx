"use client";
// Client only for the active-page highlight.
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  ["/", "Home"],
  ["/money", "Money"],
  ["/cart", "Cart"],
  ["/chores", "Chores"],
  ["/reminders", "Reminders"],
  ["/leasing", "Leasing"],
  ["/upkeep", "Upkeep"],
  ["/members", "Roommates"],
] as const;

export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="nav">
      {NAV.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>
      ))}
    </nav>
  );
}
