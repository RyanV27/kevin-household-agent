// P4 · Ryan.
import type { Ctx } from "./types";

export type Reminder = { id: string; householdId: string; text: string; dueAt: Date; memberName: string | null; recurring: "monthly" | null };

export async function setReminder(ctx: Ctx, input: { text: string; dueAt: Date; memberId?: string; recurring?: "monthly" }): Promise<Reminder> {
  // TODO(Ryan, P4)
  return { id: "fake", householdId: ctx.householdId, text: input.text, dueAt: input.dueAt, memberName: null, recurring: input.recurring ?? null };
}

export async function listReminders(ctx: Pick<Ctx, "householdId">): Promise<Reminder[]> {
  // TODO(Ryan, P4): unsent, soonest first
  return [];
}

export async function cancelReminder(ctx: Ctx, input: { reminderId: string }): Promise<void> {
  // TODO(Ryan, P4)
}

/** Scheduler only: all households' unsent reminders with dueAt <= now. */
export async function dueReminders(now = new Date()): Promise<Reminder[]> {
  // TODO(Ryan, P4)
  return [];
}

/** Scheduler only: set sent_at; if recurring monthly, insert next month's copy. */
export async function markSent(reminderId: string): Promise<void> {
  // TODO(Ryan, P4)
}

/** Creates/refreshes the monthly rent reminder from house settings. Call after settings change. */
export async function syncRentReminder(ctx: Pick<Ctx, "householdId">): Promise<void> {
  // TODO(Ryan, P4)
}
