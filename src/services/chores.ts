// P3 · Ryan.
import type { Ctx } from "./types";

export type ChoreStatus = { choreId: string; name: string; lastDoneBy: string | null; lastDoneAt: Date | null; overdue: boolean; whoseTurn: string | null };
export type ShameRow = { memberId: string; name: string; daysSinceLastChore: number | null; choresThisWeek: number };

export async function addChore(ctx: Ctx, input: { name: string; everyDays: number }): Promise<void> {
  // TODO(Ryan, P3)
}

/** Fuzzy-matches the chore by name; creates it (every 7 days) if unknown. Logs it for ctx.actorId by default. */
export async function logChore(ctx: Ctx, input: { chore: string; memberId?: string }): Promise<{ chore: string; streak: number }> {
  // TODO(Ryan, P3)
  return { chore: input.chore, streak: 1 };
}

export async function choreStatus(ctx: Pick<Ctx, "householdId">): Promise<ChoreStatus[]> {
  // TODO(Ryan, P3): whoseTurn = active member with the oldest last log for that chore
  return [];
}

/** Sorted worst first. */
export async function hallOfShame(ctx: Pick<Ctx, "householdId">): Promise<ShameRow[]> {
  // TODO(Ryan, P3)
  return [];
}
