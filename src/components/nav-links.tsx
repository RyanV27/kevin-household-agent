"use client";
// Client only for the active-page highlight.
import Link from "next/link";
import { usePathname } from "next/navigation";

// [href, label, tooltip]. The tooltips are Kevin being Kevin; the labels stay boring so people can find things.
const NAV = [
  ["/", "Home", "This is my house. I have to defend it."],
  ["/money", "Money", "Keep the change, ya filthy animal."],
  ["/cart", "Cart", "A lovely cheese pizza, just for me."],
  ["/chores", "Chores", "Buzz, your girlfriend… woof."],
  ["/reminders", "Reminders", "KEVIN!!!"],
  ["/inbox", "Inbox", "Mail from the Wet Bandits?"],
  ["/upkeep", "Upkeep", "Trap check."],
  ["/members", "Roommates", "The McCallisters."],
] as const;

export function NavLinks({ unread = 0 }: { unread?: number }) {
  const path = usePathname();
  return (
    <nav className="nav">
      {NAV.map(([href, label, tip]) => (
        <Link key={href} href={href} title={tip} aria-current={path === href ? "page" : undefined}>
          {label}
          {href === "/inbox" && unread > 0 && <span className="badge" aria-label={`${unread} unread`}>{unread}</span>}
        </Link>
      ))}
    </nav>
  );
}
