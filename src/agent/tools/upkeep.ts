// P8 · Sudhersan.
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { upkeep } from "@/services";
import type { Ctx } from "@/services/types";

export const upkeepTools = (ctx: Ctx) => ({
  add_maintenance: createTool({
    id: "add_maintenance",
    description: "Track a recurring upkeep item, e.g. 'change the AC filter every 90 days'.",
    inputSchema: z.object({ item: z.string(), everyDays: z.number().int().positive() }),
    execute: async (input) => {
      await upkeep.addMaintenance(ctx, input);
      return { ok: true };
    },
  }),
  maintenance_done: createTool({
    id: "maintenance_done",
    description: "Mark an upkeep item done today.",
    inputSchema: z.object({ item: z.string() }),
    execute: async (input) => {
      await upkeep.markDone(ctx, input);
      return { ok: true };
    },
  }),
});
