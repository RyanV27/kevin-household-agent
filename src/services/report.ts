// P3 · Ryan. The Kevin Report: chat tool, home page cards, and the weekly scheduled post all use this.
import type { Ctx } from "./types";
import { getBalances, getSettlePlan } from "./money";
import { choreStatus, hallOfShame } from "./chores";
import { listReminders } from "./reminders";
import { dueMaintenance } from "./upkeep";

export async function kevinReport(ctx: Pick<Ctx, "householdId">) {
  const [balances, settlePlan, chores, shame, upcoming, upkeep] = await Promise.all([
    getBalances(ctx),
    getSettlePlan(ctx),
    choreStatus(ctx),
    hallOfShame(ctx),
    listReminders(ctx),
    dueMaintenance(ctx),
  ]);
  return { balances, settlePlan, chores, shame, upcoming: upcoming.slice(0, 5), upkeep };
}

export type KevinReport = Awaited<ReturnType<typeof kevinReport>>;
