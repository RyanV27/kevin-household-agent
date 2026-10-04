// P8 · nice to have.
import type { Ctx } from "./types";

export type MaintenanceItem = { id: string; item: string; everyDays: number; lastDone: Date | null; nextDue: Date | null };

export async function addMaintenance(ctx: Ctx, input: { item: string; everyDays: number }): Promise<void> {
  // TODO(P8)
}

export async function markDone(ctx: Ctx, input: { item: string }): Promise<void> {
  // TODO(P8)
}

export async function dueMaintenance(ctx: Pick<Ctx, "householdId">): Promise<MaintenanceItem[]> {
  // TODO(P8)
  return [];
}
