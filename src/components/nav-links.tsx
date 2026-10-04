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
  ["/inbox", "Inbox"],
  ["/upkeep", "Upkeep"],
  ["/members", "Roommates"],
] as const;

export function NavLinks({ unread = 0 }: { unread?: number }) {
  const path = usePathname();
  return (
    <nav className="nav">
      {NAV.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>
          {label}
          {href === "/inbox" && unread > 0 && <span className="badge" aria-label={`${unread} unread`}>{unread}</span>}
        </Link>
      ))}
    </nav>
  );
}
