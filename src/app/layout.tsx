import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = { title: "Kevin", description: "Nobody cheats Kevin." };

const NAV = ["money", "cart", "chores", "reminders", "leasing", "upkeep", "members"];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", maxWidth: 960, margin: "0 auto", padding: 16 }}>
        <nav style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <Link href="/"><b>🏠 Kevin</b></Link>
          {NAV.map((n) => <Link key={n} href={`/${n}`}>{n[0].toUpperCase() + n.slice(1)}</Link>)}
        </nav>
        {children}
      </body>
    </html>
  );
}
