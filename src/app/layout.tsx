import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Fraunces, Inter } from "next/font/google";
import { dashboardCtx } from "@/lib/dashboard";
import { leasing, members } from "@/services";
import { NavLinks } from "@/components/nav-links";
import { AskKevin } from "@/components/ask-kevin";
import "./globals.css";

export const metadata = { title: "Kevin", description: "Nobody cheats Kevin." };
// The layout reads the DB (roommates, unread mail), so nothing can be prerendered at build time, not even 404.
export const dynamic = "force-dynamic";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

// The dashboard acts as this member (default payer / doer / adder), like the sender in chat.
async function setActor(form: FormData) {
  "use server";
  (await cookies()).set("actor", String(form.get("actor")), { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const ctx = await dashboardCtx();
  const [people, unread] = ctx
    ? await Promise.all([members.listMembers(ctx), leasing.unreadCount(ctx).catch(() => 0)])
    : [[], 0];
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="plaid" />
        <div className="shell">
          <header className="topbar">
            <Link href="/" className="brand"><b>🏠 Kevin</b><small>Nobody cheats Kevin.</small></Link>
            <NavLinks unread={unread} />
            {people.length > 0 && (
              <form action={setActor} className="actor">
                <label htmlFor="actor">Acting as</label>
                <select id="actor" name="actor" defaultValue={ctx?.actorId}>
                  {people.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button className="btn-ghost">Switch</button>
              </form>
            )}
          </header>
          {children}
        </div>
        <AskKevin actorName={people.find((m) => m.id === ctx?.actorId)?.name} />
      </body>
    </html>
  );
}
