// P5 · Sudhersan.
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { leasing } from "@/services";
import type { Ctx } from "@/services/types";

export const leasingTools = (ctx: Ctx) => ({
  create_work_order: createTool({
    id: "create_work_order",
    description: "Email the leasing office a maintenance request (broken AC, leaking sink).",
    inputSchema: z.object({
      issue: z.string(),
      location: z.string().optional(),
      urgency: z.enum(["low", "normal", "urgent"]).optional(),
    }),
    execute: async (input) => leasing.createWorkOrder(ctx, input),
  }),
  email_leasing: createTool({
    id: "email_leasing",
    description: "Send any other email to the leasing office.",
    inputSchema: z.object({ subject: z.string(), body: z.string() }),
    execute: async (input) => leasing.sendToLeasing(ctx, input),
  }),
});
