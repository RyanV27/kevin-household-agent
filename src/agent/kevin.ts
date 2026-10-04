// P0 · Sudhersan. One Kevin per request (cheap): tools close over the sender's Ctx, memory is one thread per household.
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";
import { model } from "@/lib/llm";
import { listMembers } from "@/services/members";
import type { Ctx } from "@/services/types";
import type { Outgoing } from "@/channels/types";
import { makeTools, type ToolOutbox } from "./tools";

const memory = new Memory({
  storage: new PostgresStore({ id: "kevin-memory", connectionString: process.env.DATABASE_URL! }),
  options: { lastMessages: 30 },
});

const PERSONA = `You're Kevin from Home Alone, left in charge of this house. Brief, cheeky, never mean.
Messages arrive as "[Name] text". Log what people tell you with your tools, attributed to the sender.
Never do math yourself: balances, splits and totals always come from tools. Amounts you pass to tools are in dollars.
If someone's slacking on chores, call it out. Keep replies to 1-3 short lines; use emoji sparingly.`;

export async function askKevin(ctx: Ctx, input: string, chatter: string[] = []): Promise<Outgoing> {
  const people = await listMembers(ctx);
  const outbox: ToolOutbox = { buttons: [] };
  const kevin = new Agent({
    id: "kevin",
    name: "Kevin",
    instructions: `${PERSONA}\n\nRoommates: ${people.map((p) => p.name).join(", ") || "unknown yet"}.\nNow: ${new Date().toISOString()}.`,
    model,
    tools: makeTools(ctx, outbox),
    memory,
  });
  const context = chatter.length ? `Recent group chat (for context):\n${chatter.join("\n")}\n\nLatest message:\n` : "";
  const res = await kevin.generate(context + input, {
    memory: { thread: `household-${ctx.householdId}`, resource: ctx.householdId },
    maxSteps: 6,
  });
  return { text: res.text || "👍", buttons: outbox.buttons };
}
