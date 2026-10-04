// P5 · Leasing office email + the shared inbox. AgentMail (lib/agentmail.ts) holds the mailbox; the emails table
// keeps a copy of what was sent/received so Kevin and the report can read it without calling AgentMail.
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import * as mail from "@/lib/agentmail";
import { getHousehold } from "./members";
import type { Ctx } from "./types";

const { emails, households } = schema;

export type InboundEmail = { from: string; to: string; subject: string; text: string; threadId?: string };
export type { MailThread, MailMessage } from "@/lib/agentmail";

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

async function addresses(householdId: string) {
  const house = await getHousehold(householdId);
  return { inbox: norm(house?.inboxAddress) || norm(process.env.AGENTMAIL_INBOX) || null, leasing: norm(house?.leasingEmail) || null };
}

export async function sendToLeasing(ctx: Ctx, input: { subject: string; body: string; threadId?: string }): Promise<{ threadId: string | null }> {
  if (!process.env.AGENTMAIL_API_KEY) throw new Error("AgentMail isn't configured (AGENTMAIL_API_KEY), so Kevin can't send mail yet.");
  const { inbox, leasing } = await addresses(ctx.householdId);
  if (!inbox) throw new Error("Kevin has no inbox yet. Set it in Roommates → House settings.");
  if (!leasing) throw new Error("No leasing office email yet. Set it in Roommates → House settings.");
  const { threadId } = await mail.sendEmail({ from: inbox, to: leasing, subject: input.subject, text: input.body, threadId: input.threadId });
  await db.insert(emails).values({ householdId: ctx.householdId, direction: "out", subject: input.subject, body: input.body, threadId });
  return { threadId };
}

export async function createWorkOrder(ctx: Ctx, input: { issue: string; location?: string; urgency?: "low" | "normal" | "urgent" }): Promise<{ threadId: string | null }> {
  return sendToLeasing(ctx, {
    subject: `Work order: ${input.issue}`,
    body: `Hi, we'd like to report an issue${input.location ? ` in the ${input.location}` : ""}: ${input.issue}. Urgency: ${input.urgency ?? "normal"}. Thanks, the residents (sent by Kevin)`,
  });
}

/** Store it, return a short group summary. Caller posts it via channel.send and may set reminders. */
export async function handleInboundEmail(email: InboundEmail): Promise<{ householdId: string; summary: string } | null> {
  const to = norm(email.to);
  if (!to) return null;
  // Match case-insensitively; a house with no inbox of its own falls back to the shared AGENTMAIL_INBOX, same as sending does.
  const all = await db.select().from(households);
  const house =
    all.find((h) => norm(h.inboxAddress) === to) ??
    (norm(process.env.AGENTMAIL_INBOX) === to ? (all.find((h) => !h.inboxAddress) ?? all[0]) : undefined);
  if (!house) return null;
  await db.insert(emails).values({ householdId: house.id, direction: "in", subject: email.subject, body: email.text, threadId: email.threadId });
  return { householdId: house.id, summary: summarize(email.subject, email.text) };
}

const summarize = (subject: string, text: string) => {
  const gist = text.replace(/\s+/g, " ").trim();
  return `"${subject}"\n${gist.length > 200 ? `${gist.slice(0, 200)}…` : gist}`;
};

export async function listEmails(ctx: Pick<Ctx, "householdId">, limit = 50) {
  return db
    .select({ direction: emails.direction, subject: emails.subject, body: emails.body, createdAt: emails.createdAt })
    .from(emails)
    .where(eq(emails.householdId, ctx.householdId))
    .orderBy(desc(emails.createdAt))
    .limit(limit);
}

// ---- Shared inbox (dashboard): read straight from AgentMail so every roommate sees the same mailbox and unread state.

export async function inboxThreads(ctx: Pick<Ctx, "householdId">): Promise<mail.MailThread[]> {
  const { inbox } = await addresses(ctx.householdId);
  return inbox ? mail.listThreads(inbox) : [];
}

export async function unreadCount(ctx: Pick<Ctx, "householdId">): Promise<number> {
  const { inbox } = await addresses(ctx.householdId);
  return inbox ? mail.unreadCount(inbox) : 0;
}

/** Opening a thread marks it read for everyone and copies received messages into the emails table (if missing). */
export async function openThread(ctx: Pick<Ctx, "householdId">, threadId: string): Promise<mail.MailMessage[]> {
  const { inbox } = await addresses(ctx.householdId);
  if (!inbox) return [];
  const messages = await mail.getThread(inbox, threadId);
  const unread = messages.filter((m) => m.unread).map((m) => m.messageId);
  if (unread.length) await mail.markRead(inbox, unread);
  // The webhook may already have stored some of them. We don't store AgentMail's message id, so a received message counts
  // as stored when a row in this thread has the same timestamp (rows we copied) or the same subject+body (rows the webhook wrote).
  const stored = await db
    .select({ createdAt: emails.createdAt, subject: emails.subject, body: emails.body })
    .from(emails)
    .where(and(eq(emails.householdId, ctx.householdId), eq(emails.threadId, threadId), eq(emails.direction, "in")));
  const seenAt = new Set(stored.map((r) => r.createdAt.getTime()));
  const seenText = new Set(stored.map((r) => `${r.subject}\n${r.body}`));
  const missing = messages.filter((m) => !m.sent && !seenAt.has(m.at.getTime()) && !seenText.has(`${m.subject}\n${m.text}`));
  if (missing.length) {
    await db.insert(emails).values(missing.map((m) => ({ householdId: ctx.householdId, direction: "in" as const, subject: m.subject, body: m.text, threadId, createdAt: m.at })));
  }
  return messages.map((m) => ({ ...m, unread: false }));
}
