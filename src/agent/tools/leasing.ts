// P5 · Sudhersan.
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { leasing } from "@/services";
import type { Ctx } from "@/services/types";

export const leasingTools = (ctx: Ctx) => ({
  create_work_order: createTool({
    id: "create_work_order",
    description:
      "Email the leasing office a maintenance request ('the sink is leaking, tell the leasing office', broken AC). Use this, not email_leasing, for anything broken.",
    inputSchema: z.object({
      issue: z.string().min(1).describe("Short description, e.g. 'kitchen sink is leaking'"),
      location: z.string().optional().describe("Room, e.g. 'kitchen'"),
      urgency: z.enum(["low", "normal", "urgent"]).optional(),
    }),
    execute: async (input) => leasing.createWorkOrder(ctx, input),
  }),
  email_leasing: createTool({
    id: "email_leasing",
    description: "Send any other email to the leasing office (questions, notices, lease stuff). Not for repairs.",
    inputSchema: z.object({ subject: z.string().min(1), body: z.string().min(1) }),
    execute: async (input) => leasing.sendToLeasing(ctx, input),
  }),
});
