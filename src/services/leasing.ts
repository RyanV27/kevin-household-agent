// P5 · Ryan (service + inbound route) with Sudhersan (AgentMail client in lib/agentmail.ts).
import type { Ctx } from "./types";

export type InboundEmail = { from: string; to: string; subject: string; text: string; threadId?: string };

export async function sendToLeasing(ctx: Ctx, input: { subject: string; body: string }): Promise<{ threadId: string | null }> {
  // TODO(P5): AgentMail send from household.inboxAddress to household.leasingEmail, insert emails row (out)
  return { threadId: null };
}

export async function createWorkOrder(ctx: Ctx, input: { issue: string; location?: string; urgency?: "low" | "normal" | "urgent" }): Promise<{ threadId: string | null }> {
  return sendToLeasing(ctx, {
    subject: `Work order: ${input.issue}`,
    body: `Hi, we'd like to report an issue${input.location ? ` in the ${input.location}` : ""}: ${input.issue}. Urgency: ${input.urgency ?? "normal"}. Thanks, the residents (sent by Kevin)`,
  });
}

/** Store it, return a short group summary. Caller posts it via channel.send and may set reminders. */
export async function handleInboundEmail(email: InboundEmail): Promise<{ householdId: string; summary: string } | null> {
  // TODO(P5): find household by inbox address (email.to), insert emails row (in)
  return null;
}

export async function listEmails(ctx: Pick<Ctx, "householdId">) {
  // TODO(P5)
  return [] as { direction: "in" | "out"; subject: string; body: string; createdAt: Date }[];
}
