// P4 · Sudhersan.
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { reminders } from "@/services";
import type { Ctx } from "@/services/types";
import { memberIdByName } from "./util";

export const reminderTools = (ctx: Ctx) => ({
  set_reminder: createTool({
    id: "set_reminder",
    description: `Set a reminder for the group or one roommate. Resolve relative times yourself; now is given in the input. dueAt is ISO 8601.`,
    inputSchema: z.object({
      text: z.string(),
      dueAt: z.string().describe("ISO 8601 with timezone"),
      who: z.string().optional(),
      monthly: z.boolean().optional(),
    }),
    execute: async ({ text, dueAt, who, monthly }) =>
      reminders.setReminder(ctx, {
        text,
        dueAt: new Date(dueAt),
        memberId: who ? await memberIdByName(ctx, who) : undefined,
        recurring: monthly ? "monthly" : undefined,
      }),
  }),
  list_reminders: createTool({
    id: "list_reminders",
    description: "Upcoming reminders.",
    inputSchema: z.object({}),
    execute: async () => reminders.listReminders(ctx),
  }),
});
