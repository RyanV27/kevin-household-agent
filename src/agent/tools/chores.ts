// P3 · Sudhersan.
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { chores, report } from "@/services";
import type { Ctx } from "@/services/types";
import { memberIdByName } from "./util";

export const choreTools = (ctx: Ctx) => ({
  log_chore: createTool({
    id: "log_chore",
    description: "Record a chore someone did ('I cleaned the bathroom', 'took out trash'). Default = sender.",
    inputSchema: z.object({ chore: z.string(), who: z.string().optional() }),
    execute: async ({ chore, who }) =>
      chores.logChore(ctx, { chore, memberId: who ? await memberIdByName(ctx, who) : undefined }),
  }),
  chore_status: createTool({
    id: "chore_status",
    description: "Chores: last done, overdue, whose turn, and the Hall of Shame.",
    inputSchema: z.object({}),
    execute: async () => ({ chores: await chores.choreStatus(ctx), shame: await chores.hallOfShame(ctx) }),
  }),
  kevin_report: createTool({
    id: "kevin_report",
    description: "The full Kevin Report: balances, settle plan, chores, Hall of Shame, upcoming reminders, upkeep.",
    inputSchema: z.object({}),
    execute: async () => report.kevinReport(ctx),
  }),
});
