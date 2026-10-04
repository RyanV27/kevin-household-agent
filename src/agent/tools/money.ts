// P1 · Sudhersan.
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { money } from "@/services";
import type { Ctx } from "@/services/types";
import { memberIdByName, toCents } from "./util";

export const moneyTools = (ctx: Ctx) => ({
  log_expense: createTool({
    id: "log_expense",
    description: "Record that someone paid for something shared. Defaults: payer = sender, split evenly among everyone.",
    inputSchema: z.object({
      amount: z.number().positive().describe("Dollars, e.g. 62.5"),
      description: z.string(),
      payer: z.string().optional().describe("Roommate name if not the sender"),
      splitAmong: z.array(z.string()).optional().describe("Roommate names; omit for everyone"),
    }),
    execute: async ({ amount, description, payer, splitAmong }) =>
      money.logExpense(ctx, {
        cents: toCents(amount),
        description,
        payerId: payer ? await memberIdByName(ctx, payer) : undefined,
        splitAmong: splitAmong ? await Promise.all(splitAmong.map((n) => memberIdByName(ctx, n))) : undefined,
      }),
  }),
  get_balances: createTool({
    id: "get_balances",
    description: "Who owes what: current balances plus the minimal set of payments to settle up. Amounts in cents.",
    inputSchema: z.object({}),
    execute: async () => ({ balances: await money.getBalances(ctx), settlePlan: await money.getSettlePlan(ctx) }),
  }),
  settle_up: createTool({
    id: "settle_up",
    description: "Record a payment between roommates (e.g. 'I paid Ryan back $30'). Default payer = sender.",
    inputSchema: z.object({ to: z.string(), amount: z.number().positive(), from: z.string().optional() }),
    execute: async ({ to, amount, from }) => {
      await money.settleUp(ctx, {
        toId: await memberIdByName(ctx, to),
        fromId: from ? await memberIdByName(ctx, from) : undefined,
        cents: toCents(amount),
      });
      return { ok: true };
    },
  }),
});
