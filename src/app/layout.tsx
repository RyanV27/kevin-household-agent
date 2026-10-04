import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { dashboardCtx } from "@/lib/dashboard";
import { members } from "@/services";

export const metadata = { title: "Kevin", description: "Nobody cheats Kevin." };

const NAV = ["money", "cart", "chores", "reminders", "leasing", "upkeep", "members"];

// The dashboard acts as this member (default payer / doer / adder), like the sender in chat.
async function setActor(form: FormData) {
  "use server";
  (await cookies()).set("actor", String(form.get("actor")), { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const ctx = await dashboardCtx();
  const people = ctx ? await members.listMembers(ctx) : [];
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", maxWidth: 960, margin: "0 auto", padding: 16 }}>
        <nav style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/"><b>🏠 Kevin</b></Link>
          {NAV.map((n) => <Link key={n} href={`/${n}`}>{n[0].toUpperCase() + n.slice(1)}</Link>)}
          {people.length > 0 && (
            <form action={setActor} style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <label htmlFor="actor"><small>Acting as</small></label>
              <select id="actor" name="actor" defaultValue={ctx?.actorId}>
                {people.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <button>Switch</button>
            </form>
          )}
        </nav>
        {children}
      </body>
    </html>
  );
}
