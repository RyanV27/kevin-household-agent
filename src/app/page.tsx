// P3 · Ryan. Home = the Kevin Report as cards.
import { dashboardCtx } from "@/lib/dashboard";
import { kevinReport } from "@/services/report";
import { dollars } from "@/services/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const ctx = await dashboardCtx();
  if (!ctx) return <p>No household yet. Add Kevin to a Telegram group and say hi, or run <code>npm run seed</code>.</p>;
  const r = await kevinReport(ctx);
  return (
    <main>
      <h1>The Kevin Report</h1>
      <section>
        <h2>Who pays whom</h2>
        {r.settlePlan.length ? (
          <ul>{r.settlePlan.map((t, i) => <li key={i}>{t.fromName} → {t.toName}: {dollars(t.cents)}</li>)}</ul>
        ) : <p>All square.</p>}
      </section>
      {/* TODO(Ryan, P3): chores card, Hall of Shame, upcoming reminders, upkeep */}
      <pre>{JSON.stringify({ chores: r.chores, shame: r.shame, upcoming: r.upcoming }, null, 2)}</pre>
    </main>
  );
}
