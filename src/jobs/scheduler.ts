// P4 · Sudhersan. Started once from instrumentation.ts; fine because the Fly Machine never sleeps.
import { telegram } from "@/channels/telegram";
import { dueReminders, markSent } from "@/services/reminders";

const TICK_MS = 60_000;

async function tick() {
  for (const r of await dueReminders()) {
    // TODO(Sudhersan, P4): give it Kevin's attitude (template or a quick LLM call), @-mention r.memberName
    await telegram.send(r.householdId, { text: `⏰ ${r.text}` });
    await markSent(r.id);
  }
  // TODO(P3/P4): weekly Kevin Report (e.g. Sunday 6 PM) and due maintenance nudges
}

export function startScheduler() {
  const g = globalThis as { __kevinScheduler?: NodeJS.Timeout };
  if (g.__kevinScheduler) return;
  g.__kevinScheduler = setInterval(() => tick().catch((e) => console.error("scheduler", e)), TICK_MS);
  console.log("scheduler started");
}
