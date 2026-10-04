// P1 · Ryan. Stubs return fake data so the agent tools work today. Replace bodies, keep signatures.
import type { Ctx } from "./types";

export type Balance = { memberId: string; name: string; cents: number }; // + = is owed, - = owes
export type Transfer = { fromId: string; fromName: string; toId: string; toName: string; cents: number };
export type Expense = { id: string; payerName: string; cents: number; description: string; createdAt: Date };

/** splitAmong = member ids; default = all active members, split evenly (remainder cents to the payer). */
export async function logExpense(
  ctx: Ctx,
  input: { payerId?: string; cents: number; description: string; splitAmong?: string[] },
): Promise<Expense> {
  // TODO(Ryan, P1): insert expenses + expense_splits; payerId defaults to ctx.actorId
  return { id: "fake", payerName: "You", cents: input.cents, description: input.description, createdAt: new Date() };
}

export async function getBalances(ctx: Pick<Ctx, "householdId">): Promise<Balance[]> {
  // TODO(Ryan, P1): paid - owed per member, minus/plus settlements
  return [];
}

/** Minimal set of transfers that zeroes all balances (greedy: biggest debtor pays biggest creditor). */
export function computeSettlePlan(balances: Balance[]): Transfer[] {
  // TODO(Ryan, P1): pure function, unit-test it in money.test.ts
  return [];
}

export async function getSettlePlan(ctx: Pick<Ctx, "householdId">): Promise<Transfer[]> {
  return computeSettlePlan(await getBalances(ctx));
}

export async function settleUp(ctx: Ctx, input: { fromId?: string; toId: string; cents: number }): Promise<void> {
  // TODO(Ryan, P1): insert settlements; fromId defaults to ctx.actorId
}

export async function listExpenses(ctx: Pick<Ctx, "householdId">, limit = 50): Promise<Expense[]> {
  // TODO(Ryan, P1)
  return [];
}
